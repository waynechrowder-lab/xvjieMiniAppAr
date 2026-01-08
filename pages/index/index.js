// pages/index/index.js
const { POI_LIST } = require('../data/poi.js');
const Base_URL = 'https://shanghai-mashu-wxapp.oss-cn-shanghai.aliyuncs.com/ui/zhengding/main';
// ===== 分类配置 =====
const CATEGORY_LIST = [
  { id: 'scenic',    name: '古城景点', line1: '古城', line2: '景点', img: Base_URL+'/category/category 1.png',imgActive: Base_URL+'/category/category 1 active.png' },
  { id: 'arCheckin', name: 'AR打卡',   line1: 'AR',   line2: '打卡', img: Base_URL+'/category/category 2.png',imgActive: Base_URL+'/category/category 2 active.png' },
  { id: 'arHistory', name: 'AR访古',   line1: 'AR',   line2: '访古', img: Base_URL+'/category/category 3.png',imgActive: Base_URL+'/category/category 3 active.png' },
  { id: 'public',    name: '公共设施', line1: '公共', line2: '设施', img: Base_URL+'/category/category 4.png',imgActive: Base_URL+'/category/category 4 active.png' },
  { id: 'business',  name: '商业设施', line1: '商业', line2: '设施', img: Base_URL+'/category/category 5.png',imgActive: Base_URL+'/category/category 5 active.png' }
];

// ===== 地图与高清切片配置 =====
const MAP_WIDTH_RPX = 2048;
const MAP_HEIGHT_RPX = 1365;

const TILE_ROWS = 3;
const TILE_COLS = 3;

// OSS 基础路径（按你实际的来）
const HD_BASE_URL = 'https://shanghai-mashu-wxapp.oss-cn-shanghai.aliyuncs.com/map/maps/';
// 最终拼出来是：map1_1.jpg ~ map3_3.jpg

Page({
  data: {
    poi_bg: 'https://shanghai-mashu-wxapp.oss-cn-shanghai.aliyuncs.com/ui/zhengding/main/poi-bg.png',
    poi_bg_not:'https://shanghai-mashu-wxapp.oss-cn-shanghai.aliyuncs.com/ui/zhengding/main/poi-bg-not%20arrive.png',

    // 分类 & 业务状态 --------------------
    categoryList: CATEGORY_LIST.map((c, index) => ({
      ...c,
      active: index === 0
    })),
    selectedCategoryId: CATEGORY_LIST[0].id,

    poiList: [],

    showPopup: false,
    currentPoi: {},
    currentTab: 'home',

    // 地图状态 ---------------------------
    translateX: 0,
    translateY: 0,
    scale: 1,
    scaleMin: 1,
    scaleMax: 3.5,
    windowWidth: 0,
    windowHeight: 0,

    mapWidth: 0,   // 地图逻辑宽（px）
    mapHeight: 0,  // 地图逻辑高（px）

    tileList: [],       // 3×3 高清切片
    showHdTiles: false  // 是否显示高清切片层
  },

  // ===== 手势运行时变量（不放 data，避免频繁 setData） =====
  touchMode: 'none', // 'drag' | 'pinch' | 'none'

  // 拖拽
  dragStartX: 0,
  dragStartY: 0,
  dragStartTranslateX: 0,
  dragStartTranslateY: 0,

  // 捏合缩放
  pinchStartDist: 0,
  pinchStartScale: 1,
  pinchWorldX0: 0,
  pinchWorldY0: 0,

  // 惯性
  lastMoveTime: 0,
  lastMoveX: 0,
  lastMoveY: 0,
  velocityX: 0,
  velocityY: 0,
  inertiaTimer: null,

  // ================= 生命周期 =================

  onLoad() {
    wx.getSystemInfo({
      success: (res) => {
        const ww = res.windowWidth;
        const wh = res.windowHeight;

        // rpx -> px（按 750 设计宽）
        const mapW = ww * (MAP_WIDTH_RPX / 750);
        const mapH = ww * (MAP_HEIGHT_RPX / 750);

        const s = this.data.scale;

        // 初始：地图居中
        const initX = (ww - mapW * s) / 2;
        const initY = (wh - mapH * s) / 2;

        this.setData({
          windowWidth: ww,
          windowHeight: wh,
          mapWidth: mapW,
          mapHeight: mapH,
          translateX: initX,
          translateY: initY,
          scale: s
        });

        // 初始化高清切片信息
        this.initTiles(mapW, mapH);

        // 初始化 POI 可见性（按分类）
        this.updatePoiVisible();
      }
    });
  },

  // ================= 分类 & POI 业务逻辑 =================

  onToggleCategory(e) {
    const id = e.currentTarget.dataset.id;
    if (id === this.data.selectedCategoryId) return;

    const newCategoryList = this.data.categoryList.map(c => ({
      ...c,
      active: c.id === id
    }));

    this.setData(
      {
        categoryList: newCategoryList,
        selectedCategoryId: id
      },
      () => {
        this.updatePoiVisible();
      }
    );
  },

  updatePoiVisible() {
    const selectedId = this.data.selectedCategoryId;

    const poiList = POI_LIST.map(poi => {
      const visible = poi.categories.includes(selectedId);
      return {
        ...poi,
        visible,
        nameChars: poi.name.split('')
      };
    });

    this.setData({ poiList });
  },

  // 点击地图上的点位
  onTapPoi(e) {
    const id = e.currentTarget.dataset.id;
    const poi = this.data.poiList.find(p => p.id === id);
    if (!poi) return;
    this.setData({
      currentPoi: poi,
      showPopup: true
    });
  },

  onClosePopup() {
    this.setData({
      showPopup: false,
      currentPoi: {}
    });
  },

  onMaskTap() {
    this.onClosePopup();
  },

  onPopupTap() {
    // 阻止弹窗内部点击冒泡关闭
  },

  onStartNav() {
    const poi = this.data.currentPoi;
    if (!poi) return;
    console.log(poi.id);
    if (poi.poi < 70000) return;
    if (poi.arrived !== 2) return;
    this.enterAR();
    // wx.navigateTo({
    //   url: `/pages/arVisit/arVisit?poiId=${poi.id}`
    // });
  },

  enterAR() {
    const app = getApp();
    // 是否需要后台定位按需切换
    app.ensureCameraAuth()
      .then(() => {
        // （可选）若你要持续定位，再开启监听
        //  app.startLocationListening(false);
        let target = this.data.currentPoi;
        const url = target && target.poi > 70000
          ? `../../packageNav/pages/nav/nav?targetPoi=${target.poi}`
          : `../../packageNav/pages/nav/nav`;
          console.warn("enterAR " + url);
        wx.navigateTo({ url });
      })
       .catch(err => {
         console.warn("enterAR permissions failed:", err);
         wx.showToast({ title: "未获得必要权限", icon: "none" });
       });
  },

  // 底部 Tab 切换
  onChangeTab(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === this.data.currentTab) return;

    if (tab === 'home') {
      this.setData({ currentTab: 'home' });
    } else if (tab === 'checkin') {
      wx.redirectTo({
        url: '/pages/arCheckin/arCheckin'
      });
    } else if (tab === 'history') {
      wx.redirectTo({
        url: '/pages/arHistory/arHistory'
      });
    }
  },

  // ================= 高清切片布局 =================

  initTiles(mapW, mapH) {
    const tiles = [];

    for (let row = 0; row < TILE_ROWS; row++) {
      for (let col = 0; col < TILE_COLS; col++) {
        const id = `${row + 1}_${col + 1}`;

        const left = (mapW / TILE_COLS) * col;
        const top = (mapH / TILE_ROWS) * row;
        const width = mapW / TILE_COLS;
        const height = mapH / TILE_ROWS;

        tiles.push({
          id,
          row,
          col,
          left,
          top,
          width,
          height,
          src: '',       // 缩放到阈值再填
          loaded: false  // 图片 onLoad 后置 true
        });
      }
    }

    this.setData({ tileList: tiles });
  },

  // ================= 手势：拖拽 + 捏合 =================

  onTouchStart(e) {
    const touches = e.touches;

    // 新手势开始，先停掉惯性
    this.stopInertia();

    if (touches.length === 1) {
      const t = touches[0];
      this.touchMode = 'drag';

      this.dragStartX = t.clientX;
      this.dragStartY = t.clientY;
      this.dragStartTranslateX = this.data.translateX;
      this.dragStartTranslateY = this.data.translateY;

      const now = Date.now();
      this.lastMoveTime = now;
      this.lastMoveX = t.clientX;
      this.lastMoveY = t.clientY;
      this.velocityX = 0;
      this.velocityY = 0;

    } else if (touches.length >= 2) {
      // 捏合：记录双指中心对应的世界坐标
      const t1 = touches[0];
      const t2 = touches[1];
      const dx = t2.clientX - t1.clientX;
      const dy = t2.clientY - t1.clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const centerX = (t1.clientX + t2.clientX) / 2;
      const centerY = (t1.clientY + t2.clientY) / 2;

      const { translateX, translateY, scale } = this.data;

      const worldX0 = (centerX - translateX) / scale;
      const worldY0 = (centerY - translateY) / scale;

      this.touchMode = 'pinch';
      this.pinchStartDist = dist;
      this.pinchStartScale = scale;
      this.pinchWorldX0 = worldX0;
      this.pinchWorldY0 = worldY0;
    }
  },

  onTouchMove(e) {
    const touches = e.touches;

    if (this.touchMode === 'drag' && touches.length === 1) {
      const t = touches[0];

      const dx = t.clientX - this.dragStartX;
      const dy = t.clientY - this.dragStartY;

      let newX = this.dragStartTranslateX + dx;
      let newY = this.dragStartTranslateY + dy;

      const clamped = this.clampTranslate(newX, newY, this.data.scale);
      newX = clamped.x;
      newY = clamped.y;

      this.setData({
        translateX: newX,
        translateY: newY
      });

      const now = Date.now();
      const dt = now - this.lastMoveTime;
      if (dt > 0) {
        const vx = (t.clientX - this.lastMoveX) / dt;
        const vy = (t.clientY - this.lastMoveY) / dt;
        this.velocityX = vx;
        this.velocityY = vy;
        this.lastMoveTime = now;
        this.lastMoveX = t.clientX;
        this.lastMoveY = t.clientY;
      }

    } else if (this.touchMode === 'pinch' && touches.length >= 2) {
      const t1 = touches[0];
      const t2 = touches[1];

      const dx = t2.clientX - t1.clientX;
      const dy = t2.clientY - t1.clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (this.pinchStartDist <= 0) return;

      const factor = dist / this.pinchStartDist;
      let newScale = this.pinchStartScale * factor;
      newScale = Math.max(this.data.scaleMin, Math.min(this.data.scaleMax, newScale));

      const centerX = (t1.clientX + t2.clientX) / 2;
      const centerY = (t1.clientY + t2.clientY) / 2;

      const worldX0 = this.pinchWorldX0;
      const worldY0 = this.pinchWorldY0;

      let newTx = centerX - worldX0 * newScale;
      let newTy = centerY - worldY0 * newScale;

      const clamped = this.clampTranslate(newTx, newTy, newScale);
      newTx = clamped.x;
      newTy = clamped.y;

      // 缩放时控制高清切片显示
      this.updateHdTilesVisibility(newScale);

      this.setData({
        scale: newScale,
        translateX: newTx,
        translateY: newTy
      });
    }
  },

  onTouchEnd(e) {
    const touches = e.touches;

    if (touches.length === 0) {
      if (this.touchMode === 'drag') {
        this.startInertia();
      }
      this.touchMode = 'none';
      return;
    }

    // 从双指变单指：切回拖拽
    if (this.touchMode === 'pinch' && touches.length === 1) {
      const t = touches[0];
      this.touchMode = 'drag';
      this.dragStartX = t.clientX;
      this.dragStartY = t.clientY;
      this.dragStartTranslateX = this.data.translateX;
      this.dragStartTranslateY = this.data.translateY;

      const now = Date.now();
      this.lastMoveTime = now;
      this.lastMoveX = t.clientX;
      this.lastMoveY = t.clientY;
      this.velocityX = 0;
      this.velocityY = 0;
    }
  },

  // ================= 惯性 =================

  startInertia() {
    let vx = this.velocityX * 16;
    let vy = this.velocityY * 16;

    const speed = Math.sqrt(vx * vx + vy * vy);
    const minSpeed = 0.1;
    if (speed < minSpeed) {
      return;
    }

    this.stopInertia();

    const friction = 0.95;

    this.inertiaTimer = setInterval(() => {
      const { translateX, translateY, scale } = this.data;

      let newX = translateX + vx;
      let newY = translateY + vy;

      const clamped = this.clampTranslate(newX, newY, scale);
      newX = clamped.x;
      newY = clamped.y;

      this.setData({
        translateX: newX,
        translateY: newY
      });

      vx *= friction;
      vy *= friction;

      const v = Math.sqrt(vx * vx + vy * vy);
      if (v < 0.1) {
        this.stopInertia();
      }
    }, 16);
  },

  stopInertia() {
    if (this.inertiaTimer) {
      clearInterval(this.inertiaTimer);
      this.inertiaTimer = null;
    }
  },

  // ================= 边界限制：只允许在中间 80% 活动 =================

  clampTranslate(tx, ty, scale) {
    const { windowWidth, windowHeight, mapWidth, mapHeight } = this.data;

    const mapW = mapWidth * scale;
    const mapH = mapHeight * scale;

    const ACTIVE_RATIO = 0.8;
    const EDGE_RATIO = (1 - ACTIVE_RATIO) / 2; // 0.1

    let minX, maxX, minY, maxY;

    // 横向
    if (mapW <= windowWidth) {
      minX = maxX = (windowWidth - mapW) / 2;
    } else {
      const marginWorldX = mapWidth * EDGE_RATIO;

      // 最右：看到 10% 的位置
      maxX = -marginWorldX * scale;

      // 最左：看到 90% - windowWidth/scale 的位置
      const maxWorldX = mapWidth * (1 - EDGE_RATIO) - windowWidth / scale;
      minX = -maxWorldX * scale;
    }

    // 纵向
    if (mapH <= windowHeight) {
      minY = maxY = (windowHeight - mapH) / 2;
    } else {
      const marginWorldY = mapHeight * EDGE_RATIO;

      maxY = -marginWorldY * scale;

      const maxWorldY = mapHeight * (1 - EDGE_RATIO) - windowHeight / scale;
      minY = -maxWorldY * scale;
    }

    if (tx < minX) tx = minX;
    if (tx > maxX) tx = maxX;
    if (ty < minY) ty = minY;
    if (ty > maxY) ty = maxY;

    return { x: tx, y: ty };
  },

  // ================= 高清切片控制 =================

  updateHdTilesVisibility(scale) {
    const threshold = 2; // 缩放到 2 倍以上才用高清

    if (scale >= threshold) {
      const tiles = this.data.tileList.map(tile => {
        if (!tile.src) {
          tile.src = `${HD_BASE_URL}map${tile.row + 1}_${tile.col + 1}.jpg`;
        }
        return tile;
      });
      this.setData({
        showHdTiles: true,
        tileList: tiles
      });
    } else {
      this.setData({
        showHdTiles: false
      });
    }
  },

  onTileLoad(e) {
    const id = e.currentTarget.dataset.id;
    const tiles = this.data.tileList.map(tile => {
      if (tile.id === id) {
        return { ...tile, loaded: true };
      }
      return tile;
    });
    this.setData({ tileList: tiles });
  }
});
