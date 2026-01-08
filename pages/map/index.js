// pages/index/index.js
const { POI_LIST } = require('../data/poi.js');

// 地图原图尺寸（以 rpx 为单位）
const MAP_WIDTH_RPX = 2048;
const MAP_HEIGHT_RPX = 1365;

const TILE_ROWS = 3;
const TILE_COLS = 3;

// 高清原图总尺寸（像素），5000×3333 * 3（目前没用到，仅做参考）
const HD_TOTAL_WIDTH = 5000 * 3;   // 15000
const HD_TOTAL_HEIGHT = 3333 * 3;  // 9999

// OSS 基础路径
const HD_BASE_URL = 'https://shanghai-mashu-wxapp.oss-cn-shanghai.aliyuncs.com/map/maps/';

Page({
  data: {
    poiList: [],

    translateX: 0,
    translateY: 0,
    scale: 1.7,
    scaleMin: 1.7,
    scaleMax: 4,
    windowWidth: 0,
    windowHeight: 0,

    mapWidth: 0,   // 地图宽（px）
    mapHeight: 0,  // 地图高（px）

    tileList: [],      // 9 块切片
    showHdTiles: false // 是否显示高清层
  },

  // 手势模式
  touchMode: 'none', // 'drag' | 'pinch' | 'none'

  // 拖拽用
  dragStartX: 0,
  dragStartY: 0,
  dragStartTranslateX: 0,
  dragStartTranslateY: 0,

  // 捏合用
  pinchStartDist: 0,
  pinchStartScale: 1,
  pinchWorldX0: 0,
  pinchWorldY0: 0,

  // 惯性相关
  lastMoveTime: 0,
  lastMoveX: 0,
  lastMoveY: 0,
  velocityX: 0,
  velocityY: 0,
  inertiaTimer: null,

  onLoad() {
    wx.getSystemInfo({
      success: (res) => {
        const ww = res.windowWidth;
        const wh = res.windowHeight;

        // rpx -> px（按 750 设计宽）
        const mapW = ww * (MAP_WIDTH_RPX / 750);
        const mapH = ww * (MAP_HEIGHT_RPX / 750);
        const s = this.data.scale;

        // 让整张图中心对齐屏幕中心
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

        // 初始化高清切片
        this.initTiles(mapW, mapH);
      }
    });

    this.updatePoiVisible();
  },

  // 初始化 3×3 高清切片在逻辑地图中的布局
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
          src: '',       // 初始不加载
          loaded: false  // 图片 onLoad 后置 true
        });
      }
    }

    this.setData({ tileList: tiles });
  },

  // ---------- POI 逻辑（简版） ----------
  updatePoiVisible() {
    const poiList = POI_LIST.map(poi => ({
      ...poi,
      visible: true,
      nameChars: poi.name.split('')
    }));
    this.setData({ poiList });
  },

  onTapPoi(e) {
    const id = e.currentTarget.dataset.id;
    const poi = this.data.poiList.find(p => p.id === id);
    if (!poi) return;

    console.log('tap poi:', poi.name);
  },

  // ---------- 手势：拖拽 + 捏合 ----------

  onTouchStart(e) {
    const touches = e.touches;

    // 一有新触摸就停掉旧的惯性
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
      // 捏合缩放（以双指中心为缩放中心）
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

      // 计算当前速度
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
      // 双指缩放：以双指中心为缩放中心
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

      // 缩放时决定是否加载高清切片
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

    // 从双指变单指：继续拖拽
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

  // ---------- 惯性 ----------

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

  // ---------- 边界限制 ----------

// 把 (tx, ty) 限制在「地图中间 80%」区域内
clampTranslate(tx, ty, scale) {
  const { windowWidth, windowHeight, mapWidth, mapHeight } = this.data;

  const mapW = mapWidth * scale;   // 缩放后的地图宽
  const mapH = mapHeight * scale;  // 缩放后的地图高

  // 中心可移动区域比例
  const ACTIVE_RATIOW = 0.8;              // 中间 80%
  const EDGE_RATIOW = (1 - ACTIVE_RATIOW) / 2; // 两边各 10% = 0.1

  let minX, maxX, minY, maxY;

  // --- 横向 ---
  if (mapW <= windowWidth) {
    // 地图比屏幕窄：不能拖动，一直居中
    minX = maxX = (windowWidth - mapW) / 2;
  } else {
    // 逻辑：屏幕最左边最多看到 map 的 10% 处
    //      屏幕最右边最多看到 map 的 90% 处
    //
    // 世界坐标：
    //   leftWorld  ∈ [ 0.1 * mapWidth , 0.9 * mapWidth - windowWidth/scale ]
    // 映射到平移：
    //   translateX = - leftWorld * scale
    //
    // 所以：
    const marginWorldX = mapWidth * EDGE_RATIOW; // 0.1 * mapWidth

    // 最右（translateX 最大）：看到 10% 的位置
    maxX = -marginWorldX * scale; // -0.1 * mapWidth * scale

    // 最左（translateX 最小）：看到 90% - 窗口宽 的位置
    const maxWorldX = mapWidth * (1 - EDGE_RATIOW) - windowWidth / scale;
    minX = -maxWorldX * scale; // windowWidth - 0.9 * mapWidth * scale 也等价
  }
  const ACTIVE_RATIOH = 0.67;              // 中间 80%
  const EDGE_RATIOH = (1 - ACTIVE_RATIOH) / 2;
  // --- 纵向 ---
  if (mapH <= windowHeight) {
    minY = maxY = (windowHeight - mapH) / 2;
  } else {
    const marginWorldY = mapHeight * EDGE_RATIOH;

    // 最下（translateY 最大）：看到 10% 高度
    maxY = -marginWorldY * scale;

    // 最上（translateY 最小）：看到 90% - 窗口高 的位置
    const maxWorldY = mapHeight * (1 - EDGE_RATIOH) - windowHeight / scale;
    minY = -maxWorldY * scale;
  }

  // 夹紧
  if (tx < minX) tx = minX;
  if (tx > maxX) tx = maxX;
  if (ty < minY) ty = minY;
  if (ty > maxY) ty = maxY;

  return { x: tx, y: ty };
},


  // ---------- 高清切片显示控制 ----------

  updateHdTilesVisibility(scale) {
    const threshold = 2;

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
