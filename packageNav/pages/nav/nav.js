// plugin/pages/nav/nav.js
import App from "../../app";
import { setApp } from "../../index";
import { getDistance, getPosForward } from "../../utils/util"
const { ServerConfig, Config } = require('../../service/config');
const { POI_LIST } = require('../../../pages/data/poi.js');
// const { getUserId } = require('../../../pages/utils/user.js');
// const Settings = require('../../../pages/utils/settings.js');
import { NavReport } from '../../utils/reportEvent';
const easy_setting = require('../../../utils/config')
const { tinyAllinone } = requirePlugin('SPARPlugin')
const { ARManager } = tinyAllinone;

const ENTER_DIST = 5      // 进入距离
const EXIT_DIST = 7      // 退出距离（滞回）
const COOLDOWN_MS = 3000 // 冷却时间：3秒

Page({
  /**
   * 页面的初始数据
   */
  data: {
    showClsVk: false,
    shopFold: true, // 店铺信息弹窗是否收起
    floorList: [],
    floorVal: [0],
    floorFold: true,
    activeFloor: '',
    shopList: [],
    navigating: false,
    navigateInfo: '',
    navigateEnd: false,
    navigateExit: false,
    byliftRemind: false,
    erectRemind: false,
    showLocateFail: false, // 失败提示layer显示
    tags: [],
    activeTag: '',
    tabList: [],
    activeTab: '',
    searchVal: '',
    disabledSearch: true,
    targetName: '',
    targetFloorName: '',
    currentFloorName: '',
    showScan: false,
    scanStatus: 'nav', // nav: 导航识别; meta: 元宇宙内容识别; abnormal: 异常识别; share: 分享位置识别
    showSearch: false, // 是否显示搜索页
    firstLocate: true, // 一次导航流程内第一次开启定位
    showExit: false,
    showAbnormal: false,
    showAbnormalText: true,
    showAbnormalSuccess: false,
    breakAction: 'Elevator', // 中断类型，通常为 Elevator， Stairs，Escalator
    showFloorJudge: false,

    showShopShare: false,
    showAcceptShare: false,
    cubeDistance: 5,
    showShareGuide: false,
    showFb: false,

    vioReady: true, // vio是否初始化成功，在未检测是否成功之前默认true
    showVkHint: false,
    vkHintType: 'back',
    shopLength: 20,
    countTime: 5,

    navList: [],
    uid: 1,

    myModule: 'nav',
    showTakePhoto: false,
    showDescription: true,
    playing: false,
    poiList: [],
    descriptionPoi: null,
    historyPoi: null,

    checkinImage: '',      // 本地图片路径
    showCheckin: false,
    posterWidth: 300,
    posterHeight: 300,
    pixekRatio: 1,
    posterSources: null,
    save: false,
  },

  currentPicker: [0],
  targetPoi: null,
  lastFloor: null,
  shopListArr: [],
  immediatelyARNav: false,
  enterType: 'navigate', // 进入页面方式
  way: '',//上级通过什么方式进入的扫描

  _descState: {
    activePoiId: null,
    lastTriggerAtByPoi: {},
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    const info = wx.getWindowInfo()
    this.audio = wx.createInnerAudioContext()
    this.audio.obeyMuteSwitch = false
    this.audio.autoplay = false

    this.setData({
      posterWidth: 630 * info.windowWidth / 750,
      posterHeight: (980 * info.windowHeight) / 750,
    })

    // ✅ 事件只绑定一次
    this.audio.onPlay(() => this.setData({ playing: true }))
    this.audio.onPause(() => this.setData({ playing: false }))
    this.audio.onStop(() => this.setData({ playing: false }))
    this.audio.onEnded(() => this.setData({ playing: false }))
    // this.audio.onError((e) => {
    //   console.error('audio error', e)
    //   wx.showToast({ title: '音频播放失败', icon: 'none' })
    // })

    const poiList = POI_LIST.filter(poi => poi.categories?.includes('description'));
    this.setData({ poiList });
    wx.showLoading({
      title: '',
      mask: true
    })
    this.navReport = new NavReport();
    this.navReport.setTime('enter_nav');

    // const uid = getUserId();
    const uid = 3
    this.setData({ uid });

    // Settings.loadNav().then(()=>{
    //   const navList = Settings.getNav('Sheet1', this.data.navList);
    //   console.log('navList:', navList);
    //   this.setData({
    //     navList
    //   });
    // }).catch(err=>{
    //   console.warn('use local navList, settings fetch failed:', err);
    // });  

    await setApp({
      appKey: easy_setting.appKey,
      appSecret: easy_setting.appSecret,
      mallId: easy_setting.mallId,
      uuid: easy_setting.uuid,
      routeId: easy_setting.routeId,
    })
    if (options.way) this.way = options.way;
    ///传目的地直接导航	
    if (options.targetPoi) {
      console.log("接收到直接导航请求,目的地为：", options.targetPoi);
      this.setData(
        {
          immediatelyARNav: true,
        }
      )
      this.targetPoi = { id: parseInt(options.targetPoi) };

    }
    if (options.module) {
      this.setData({
        myModule: options.module
      })
    }

    console.log('myModule', this.data.myModule, 'targetPoi', this.targetPoi);
    if (this.data.myModule === 'arHistory') {
      if (this.targetPoi === null) {
        this.setData({
          historyPoi: null
        })
        return
      }
      const id = this.targetPoi.id;
      const list = POI_LIST.filter(poi => poi.categories?.includes('arHistory'));
      const poi = list.find(p => p.poi === id)
      if (poi) {
        this.setData({
          historyPoi: poi
        })
      }
    }
    console.log('historyPoi:', this.data.historyPoi);
    if (options.shareConfig) {
      const config = JSON.parse(decodeURIComponent(options.shareConfig))
      await setApp({
        appKey: config.appKey,
        appSecret: config.appSecret,
        mallId: config.mallId,
        uuid: config.uuid,
        routeId: config.routeId,
      })
      if (config.poi) {
        if (config.poi.position) {
          config.poi.realName = config.poi.name;
          config.poi.name = '朋友位置';
        }
        this.enterType = 'share';
        this.targetPoi = config.poi;
      }
    }

    if (options.config) {
      const config = JSON.parse(options.config)
      await setApp({
        appKey: config.appKey,
        appSecret: config.appSecret,
        mallId: config.mallId,
        uuid: config.uuid,
        routeId: config.routeId,
      })
    }

    ServerConfig.appMode = options.mode || 'nav';
    if (App.getApp().platform != 'devtools') {
      const blacklist = ServerConfig.wxBlacklist || getApp().globalConfig?.wxBlacklist || {};
      const arSupport = await ARManager.instance.queryARSupport(true, blacklist);
      if (arSupport.arTrackMode == 2 || arSupport.arTrackMode == 3 || arSupport.arTrackMode == 4) {
        ServerConfig.vkSupport = true
      } else {
        ServerConfig.vkSupport = false
      }
    } else {
      ServerConfig.vkSupport = false
    }

    // 判断非slam模式下弹窗交互逻辑
    if (!ServerConfig.vkSupport && !ServerConfig.enable3Dof) {
      wx.hideLoading();
      this.setData({
        showVkHint: true
      })
      return;
    }

    if (ServerConfig.cubeDistance) this.setData({ cubeDistance: ServerConfig.cubeDistance });

    const app = App.getApp();
    // await app.globalData.serverConfigPromise; // TODO: 异步设置showClsVk，不会正常识别，原因待确定
    console.log('服务端配置', ServerConfig);

    this.navReport.setValue('open_id', wx.getStorageSync('openId') || '');
    this.navReport.setValue('vksupport', ServerConfig.vkSupport ? 'yes' : 'no');

    this.setData({
      showClsVk: true,
      vkSupport: ServerConfig.vkSupport,
      clsSplit: ServerConfig.clsSplit,
      showFb: ServerConfig.feedback
    })
    this.initMallData()
    this.debounceSearch = this.debounce(this.shopSearch, 200)


  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  initMallData() {
    this.locations = ServerConfig.locations.find((item) => {
      return ServerConfig.mallId == item.id;
    })
    this.setData({
      mallName: this.locations.name
    })
    this.navReport.setValue('mall_name', this.locations.name);
    let arr = [];
    Object.keys(this.locations.buildings).forEach((item) => {
      let obj = {
        key: item,
        value: this.locations.buildings[item].name,
        types: this.locations.buildings[item].types
      }
      arr.push(obj)
    })
    this.setData({
      pickerList: arr,
      pickerIndex: 0
    })
    this.currentBuilding = arr[0] // 当前选择楼栋
    this.initBuildingData()
  },

  buildingChange(e) {
    this.setData({
      pickerIndex: e.detail.value
    })
    this.currentBuilding = this.data.pickerList[e.detail.value];
    this.initBuildingData()
  },

  onXrReady(e) {
    // xr-frame 的 scene 对象
    this.scene = e.detail.value
  },

  initBuildingData() {
    let arrFloor = [];
    let arrShop = [];
    let arrTab = [];
    let objFloor = {};
    // 大类列表
    this.locations.buildings[this.currentBuilding.key].types.forEach((item) => {
      let obj = {
        key: item,
        value: ServerConfig.types[0][item].name,
        logo: ServerConfig.types[0][item].logo,
        order: ServerConfig.types[0][item].order
      }
      arrTab.push(obj)
    })
    this.firstSortList = arrTab; // 所有大类列表
    this.setData({
      tabList: arrTab,
      activeTab: arrTab[0].key,
      activeTag: '',
      activeFloor: ''
    })
    // 当前楼栋楼层列表
    Object.keys(this.locations.floors).forEach((item, index) => {
      if (item.substring(0, 4) == this.currentBuilding.key.substring(0, 4)) {
        let obj = {
          key: item,
          value: this.locations.floors[item]
        }
        arrFloor.push(obj);
        objFloor[item] = index;
      }
    })
    this.arrFloor = arrFloor;
    // 当前楼栋所有店铺
    arrShop = ServerConfig.spots.map((item) => {
      item.floorName = this.locations.floors[item.location];
      return item
    })
    arrShop = arrShop.filter((item) => {
      return item.properties.indexOf(1) != -1
    })
    // 根据后台返回楼层顺序排序
    arrShop.sort((a, b) => {
      return objFloor[a.location] - objFloor[b.location]
    })
    if (ServerConfig.virtualPoi) arrShop = ServerConfig.virtualPoi.concat(arrShop);
    let temp = []
    this.data.navList
    arrShop.forEach(value => {
      let add = true
      this.data.navList.forEach(value2 => {
        if (value.id === value2.location_id && value2.location_identity > this.data.uid) {
          add = false
          return
        }
      });
      if (add) temp.push(value);
    });
    arrShop = temp
    console.log('arrShop:', arrShop)

    let shopList = arrShop.filter((item) => {
      return item.location.substring(0, 4) == this.currentBuilding.key.substring(0, 4) && item.properties.indexOf(1) != -1
    })

    this.shopListArr = shopList; // 当前楼栋店铺
    this.allShopList = arrShop; // 所有楼栋店铺

    this.getTags();

    this.findShop();

    // this.setData({
    //   floorList: arrFloor
    // })

  },

  getTags() {
    let tags = [];
    let floorList = [];
    Object.keys(ServerConfig.types[1]).forEach((item) => {
      let boo = false
      this.shopListArr.forEach((item2) => {
        item2.type.forEach((item3) => {
          if (item3.substring(0, 8) == item.substring(0, 8)) {
            boo = true;
          }
        })
      })
      if (!boo) return;
      let obj = {
        key: item,
        value: ServerConfig.types[1][item].name,
        logo: ServerConfig.types[1][item].logo
      }
      if (item.indexOf(this.data.activeTab.substring(0, 4)) == 0) {
        tags.push(obj)
      }
    })
    this.arrFloor.forEach((item) => {
      let boo = false;
      this.shopListArr.forEach((item2) => {
        item2.type.forEach((item3) => {
          if (item3.indexOf(this.data.activeTab.substring(0, 4)) == 0 && item2.location == item.key) {
            boo = true;
          }
        })
      })
      if (!boo) return;
      floorList.push(item)
    })
    this.setData({
      tags: tags,
      floorList: floorList
    })
  },

  debounce(func, wait) {
    let timeout;
    return function () {
      let context = this;
      let args = arguments;

      if (timeout) clearTimeout(timeout);

      let callNow = !timeout;
      timeout = setTimeout(() => {
        timeout = null;
        if (!callNow) func.apply(context, args)
      }, wait)

      if (callNow) func.apply(context, args)
    }
  },

  getScrollCtx() {
    wx.createSelectorQuery()
      .select('#scrollview')
      .node()
      .exec((res) => {
        this.scrollView = res[0].node;
      })
  },

  findShop() {
    let list = this.shopListArr.filter((item) => {
      // 判断是否属于当前中类
      let boo2 = false;
      let arr = []
      let logoLv2 = null;
      item.type.forEach((item3) => {
        if (item3.indexOf(this.data.activeTag.substring(0, 8)) == 0 && item3.indexOf(this.data.activeTab.substring(0, 4)) == 0) {
          boo2 = true;
          if (ServerConfig.types[2][item3]) {
            arr.push(ServerConfig.types[2][item3].name);
          }

          logoLv2 = logoLv2 || ServerConfig.types[1][`${item3.substring(0, 8)}0000`]?.logo || ServerConfig.types[0][`${this.data.activeTab}`]?.logo
        }
      })

      item.logo = item.logo || logoLv2;
      item.typeName = arr.join('、');
      return (item.location.indexOf(this.data.activeFloor) == 0 || item.kind == 2) && boo2;
    })
    this.setData({
      shopList: list,
      shopLength: 20,
    })
    if (!this.scrollView) {
      this.getScrollCtx()
      return;
    };
    this.scrollView.scrollTo({ top: 0 });
  },

  clsvkLoaded(e) {
    this.clsvk = e.detail.ctx;
    if (this.data.myModule === 'nav') {
      const poiList = POI_LIST
        .filter(poi => poi.categories?.includes('description'))
        .map(poi => ({
          ...poi,
          loaded: false,   // 新增字段，默认 false
        }));
      this.clsvk.poiList = poiList;
    }

    if (this.enterType == 'share') {
      this.openAcceptShare();
      return
    }
    this.setData({
      shopFold: false,
    })
    if (!ServerConfig.vkSupport) {
      this.setData({
        showVkHint: true,
        vkHintType: 'close'
      })
    }
    // this.openGuide();
    this.navReport.setTime('nav_ready');

    if (this.data.immediatelyARNav) {
      console.log("立刻开启AR导航Id", this.targetPoi);
      let target = this.shopListArr[0]
      console.log("shopListArr", this.shopListArr);
      this.shopListArr.forEach((value) => {
        if (value.id === this.targetPoi.id) {
          target = value
        }
      })
      console.log("立刻开启AR导航target", target);
      //开启导航
      this.immediatelyARNav(target)
    }
  },

  shopPopupFold() {
    this.setData({
      shopFold: !this.data.shopFold
    })
    if (this.data.shopFold) {
      this.searchCancel()
    }
  },

  maskTap() {
    this.setData({
      shopFold: true
    })
    this.searchCancel()
  },

  maskFloorTap() {
    this.setData({
      floorFold: true,
      // shopFold: false
    })
  },

  pickerChange(e) {
    const val = e.detail.value
    console.log(e)
    this.currentPicker = val
  },
  immediatelyARNav(targetPoi) {
    this.targetPoi = targetPoi;
    let name = targetPoi.name
    wx.showToast({ title: '正在前往:' + name, icon: 'none' })
    this.startNav();
    this.navReport.setTime('select_target');
    this.navReport.setValue('target_name', targetPoi);
    this.navReport.reportSelect();
  },
  selectShop(e) {
    let poi = e.currentTarget.dataset.poi;
    console.error(poi);
    this.targetPoi = poi



    // if (ServerConfig.clsSplit) {
    //   this.setData({
    //     shopFold: true,
    //     floorFold: false
    //   })
    // } else {
    //   this.startNav()
    // }
    this.startNav();
    this.navReport.setTime('select_target');
    this.navReport.setValue('target_name', poi.name);
    this.navReport.reportSelect();
  },

  confirmFloor() {
    if (ServerConfig.clsSplit) {
      this.clsvk.resetCls(null, null, this.data.floorList[this.currentPicker[0]].key)
    }
    this.setData({
      showFloorJudge: false
    })
    this.startNav();
  },

  startNav() {
    this.clsvk.getTargetInfo(this.targetPoi);

    this.setData({
      navigating: true,
      shopFold: true,
      floorFold: true,
      // currentFloorName: this.data.floorList[this.currentPicker[0]].value,
      // showScan: true,
      // targetName: this.targetPoi.name,
      // targetFloorName: this.targetPoi.floorName
    })
    this.searchCancel();
    this.setData({
      showScan: true,
      scanStatus: 'nav'
    })
  },

  vkReady(e) {
    if (e.detail) {
      this.vioInitCount = 0;
      this.setData({
        vioReady: true,
      })
    } else {
      if (!this.vioInitCount) this.vioInitCount = 0;
      this.vioInitCount++;
      if (this.vioInitCount > 5) {
        this.setData({
          vioReady: false
        })
      }
    }
  },

  liftDisable() {
    wx.showToast({
      title: '请注意是否已到达目标楼层',
      icon: 'none',
      duration: 3000
    })
  },

  liftSuccess() {
    // this.lastFloor = this.targetPoi.location;
    if (ServerConfig.clsSplit) {
      const item = this.data.floorList.find((item) => {
        return item.value == this.breakMessage.endFloor.name;
      })
      this.clsvk.resetCls(null, null, item.key);
    }
    this.clsvk.navContinue();
    this.clsvk.restartSession();

    this.setData({
      byliftRemind: false,
      // currentFloorName: this.data.targetFloorName,
      showScan: true,
      scanStatus: 'nav'
    })
  },

  selectFloor(e) {
    let key = e.target.dataset.key;
    this.setData({
      activeFloor: key
    })

    this.findShop()
  },

  selectTag(e) {
    let key = e.target.dataset.key;
    this.setData({
      activeTag: key
    })

    this.findShop()
  },

  selectTab(e) {
    let key = e.currentTarget.dataset.key;
    if (key == this.data.activeTab) return
    this.setData({
      activeTab: key,
      activeTag: '',
      activeFloor: ''
    })

    this.getTags()
    this.findShop()
  },

  scrollToLower() {
    this.setData({
      shopLength: this.data.shopLength + 20
    })
  },

  searchInput(e) {
    this.setData({
      searchVal: e.detail.value
    })
    this.debounceSearch()
  },

  searchFoucs() {
    this.setData({
      shopFold: false
    })
  },

  searchTap() {
    if (!this.data.shopFold) {
      this.setData({
        showSearch: true,
        inputFocus: true
      })
      return
    }
    this.setData({
      shopFold: false
    })
  },

  buildingTap() {
    if (!this.data.shopFold) return;
    this.setData({
      shopFold: false
    })
  },

  getNearShop() {
    let position = this.clsvk._camera3d.getPosition();
    console.error('---camera position---', position);
    let filterList = this.clsvk.annotations.filter((item) => {
      Object.assign(item, item.transform);
      return item.position.y < position.y + 1 && item.position.y > position.y - 3
    })
    let list = getDistance(filterList, position);
    // console.log('----------', position, list)
    let near = null;
    for (let i = 0; i < list.length; i++) {
      let item = this.allShopList.find((item) => {
        return item.annotation.indexOf(list[i].id) != -1
      })
      if (item) {
        // console.error('---cube---', item, list[i])
        near = Object.assign({
          position,
          distance: Math.round(list[i].distance),
        }, item)
        break;
      }
    }
    near = near || { position, distance: 99999 }; // 同层cube匹配不到店铺，则当作所有店铺离当前位置都很远
    console.log('near---', near)
    this.setData({
      showShopShare: true,
      currentSharePoi: near
    })
  },

  // 首次定位成功，即开始导航
  locateSuccess(e) {
    // if (ServerConfig.clsSplit && this.data.firstLocate) {
    //   const item = this.data.floorList.find((item) => {
    //     return item.key == e.detail.floor;
    //   })
    //   this.clsvk.pause();
    //   this.setData({
    //     showFloorJudge: true,
    //     currentFloorName: item.value,
    //   })
    //   this.resetFloorCode = item.key;
    //   return;
    // }

    if (this.data.scanStatus == 'share') {
      setTimeout(() => { this.getNearShop(); }, 100)
      this.setData({
        showScan: false,
      })
      this.clsvk.pause();
      return;
    }
    if (this.data.firstLocate) {
      wx.showToast({
        title: '定位成功',
        icon: 'none',
        duration: 3000
      })
      this.navReport.setTime('locate_success'); // TODO: 只执行一次
      this.navReport.reportLocate();
    } else {
      if (this.data.showAbnormal) {
        this.setData({
          showAbnormal: false,
          showAbnormalSuccess: true
        })
        setTimeout(() => {
          this.setData({
            showAbnormalSuccess: false
          })
        }, 2000)
      }
    }

    this.setData({
      showScan: false,
      showLocateFail: false,
      firstLocate: false,
      showExit: false
    })

  },

  resetRoute() {
    wx.showToast({
      title: '已为您重新规划路线',
      icon: 'none',
      duration: 3000
    })
  },

  navArrived(e) {
    // if (ServerConfig.clsSplit) { // TODO: 暂时只考虑导航模式，元宇宙模式后续处理
    //   this.clsvk.pause();
    // }
    this.clsvk.resetCount();
    this.clsvk.pause();
    this.setData({
      navigateInfo: '',
      navigating: false,
      navigateEnd: false
    }, () => {

    })
    wx.showToast({
      title: '恭喜您，已到达目的地！',
      duration: 3000,
      icon: 'none'
    })
    this.resetStatus();
    this.navReport.setTime('nav_arrive');
    this.navReport.report();
    this.navReport.setTime('nav_ready');
    setTimeout(() => {
      wx.navigateBack({
        delta: 1
      });
    }, 3000);


  },

  navMessage(e) {
    let distance = e.detail.data.distanceToEnd;
    let duration = distance / 1.2;
    let durationText = '';
    if (duration < 60) {
      durationText = `${~~duration} 秒`;
    } else {
      durationText = `${~~(duration / 60)} 分钟`;
    }
    this.targetPoi = e.detail.data.target;
    this.setData({
      targetName: e.detail.data.target.name,
      navigateInfo: `剩余${parseInt(distance)}米 ${durationText}`
    })
    this.onPositionUpdate(distance);
  },

  onPositionUpdate(distance) {
    if (this.data.myModule === 'arCheckin') {
      // if (distance <= ENTER_DIST) {
        this.setData({
          showTakePhoto: true
        })
      // }
      // else {
      //   this.setData({
      //     showTakePhoto: false
      //   })
      // }
    }
    else if (this.data.myModule === 'arHistory') {
      let poi = this.data.historyPoi;
      if (poi === null) {
        return
      }
      if (distance <= ENTER_DIST) {
        wx.showToast({ title: '仿古成功', icon: 'success' });
        this.setDescriptionVisible(true, poi)
        this.setData({
          historyPoi: null
        })
      }
    }
    else {
      const poi = this.clsvk?.nearPoi;
      if (!poi) {
        this.setDescriptionVisible(false)
        this._descState.activePoiId = null
        return
      }
      const id = poi.poi
      const now = Date.now()
      const lastAt = this._descState.lastTriggerAtByPoi[id] || 0
      const inCooldown = (now - lastAt) < COOLDOWN_MS
      const act = this._descState.activePoiId === id

      if (!inCooldown && !act) {
        this._descState.activePoiId = id
        this._descState.lastTriggerAtByPoi[id] = now
        this.setDescriptionVisible(true, poi)
      }
    }
  },

  setDescriptionVisible(visible, poi) {
    const url = visible ? (poi?.descriptionAudio || '') : ''
    console.log('setDescriptionVisible', visible, poi)
    // ✅ 同步去重：避免 navMessage 高频触发时重复进入
    if (visible) {
      this.setData({
        descriptionPoi: poi
      })
      if (this._descVisible && this._descAudioUrl === url) return
      this._descVisible = true
      this._descAudioUrl = url

      this.setData({ showDescription: true })
      if (!url) return
      try { this.audio.stop() } catch (e) { }
      this.audio.src = url
      this.audio.play()
    } else {
      if (!this._descVisible) return
      this._descVisible = false
      this._descAudioUrl = null

      this.setData({ showDescription: false })
      try { this.audio.stop() } catch (e) { }
    }
  },

  onSkipDescription() {
    this.setDescriptionVisible(false)
  },

  async onTakePhoto() {
    if (!this.clsvk || !this.data.showClsVk || !this.data.vioReady) {
      wx.showToast({ title: 'AR 场景未就绪', icon: 'none' });
      return;
    }

    console.log("拍照")
    this.takePic()

    // try {
    //   const filePath = await this.clsvk.takeARSnapshot() // 返回本地图片路径
    //   this.setData({
    //     checkinImage: filePath,
    //     showCheckin: true
    //   })
    //   console.log('AR截屏:', filePath);
    //   wx.showToast({ title: '打卡成功', icon: 'success' });
    //   // wx.previewImage({
    //   //   urls: [filePath],
    //   //   current: filePath
    //   // })
    // } catch (err) {
    //   console.error('AR截屏失败', err);
    //   wx.showToast({ title: '截屏失败', icon: 'none' });
    // }
    // this.onPosterStart()
  },

  closeCheckin() {
    this.setData({ showCheckin: false })
  },

  noop() { },

  saveCheckin() {
    const filePath = this.data.checkinImage
    if (!filePath) return

    wx.saveImageToPhotosAlbum({
      filePath,
      success: () => wx.showToast({ title: '已保存到相册' }),
      fail: (err) => {
        console.warn(err)
        wx.showToast({ title: '保存失败（检查相册权限）', icon: 'none' })
        wx.openSetting()
      }
    })
  },


  exitNav() {
    if (this.data.navigateEnd) {
      this.setData({
        navigateInfo: '',
        navigating: false,
        navigateEnd: false,
        immediatelyARNav: false
      })
    } else {
      this.setData({
        navigateExit: true
      })
    }
  },

  confirmExit() {
    this.setData({
      navigateInfo: '',
      navigating: false,
      navigateEnd: false,
      navigateExit: false,
      immediatelyARNav: false
    }, () => {
      // this.setData({
      //   shopFold: false,
      // })
    })
    this.clsvk.exitNav();
    this.clsvk.resetCount();
    this.resetStatus();
    this.navReport.setTime('nav_break');
    this.navReport.report();
    this.navReport.setTime('nav_ready');
    //直接退出到上一级页面
    wx.navigateBack({
      delta: 1
    });

  },

  cancelExit() {
    this.setData({
      navigating: true,
      navigateExit: false
    })
  },

  phoneErect(e) {
    this.setData({
      erectRemind: e.detail
    })
    // if (this.erectTimeout) {
    //   clearTimeout(this.erectTimeout)
    // }
    // this.erectTimeout = setTimeout(() => {
    //   this.setData({
    //     erectRemind: false
    //   })
    // }, 2000)
  },

  locateFail() {
    console.error("locateFail  locateFail!!!");
    if (this.data.firstLocate) {
      this.clsvk.pause();
      this.setData({
        showLocateFail: true,
        showScan: false
      })
    } else {
      if (this.data.showAbnormal) return;
      this.setData({
        showAbnormal: true
      })
      this.openAbnormalText()
    }
  },

  vkChange() {
    this.locateFail();
  },

  navBreak(e) {
    if (!this.data.navigating) return;
    this.clsvk.pause() // 楼梯处会识别失败，乘电梯或扶梯时暂停止识别
    this.clsvk.resetCount();
    this.clsvk.stopSession();
    this.breakMessage = e.detail.data;
    this.setData({
      breakAction: e.detail.data.startAction,
      targetFloorName: e.detail.data.endFloor.name,
      countTime: 5,
      byliftRemind: true,
      navigateInfo: '',
    })
    this.countDown();
  },

  countDown() {
    if (this.breakTimeout) {
      clearTimeout(this.breakTimeout);
      this.breakTimeout = null;
    }
    this.breakTimeout = setTimeout(() => {
      this.setData({
        countTime: this.data.countTime - 1
      })
      if (this.data.countTime <= 0) {
        clearTimeout(this.breakTimeout);
        this.breakTimeout = null;
      } else {
        this.countDown();
      }
    }, 1000)
  },

  locateAgain() {
    this.clsvk.resetCount();
    if (ServerConfig.clsSplit && this.separateLib) {
      this.setData({
        floorFold: false,
        showLocateFail: false,
      })
    } else {
      this.clsvk.resume();
      this.setData({
        showLocateFail: false,
        showScan: true,
        // scanStatus: 'nav' // TODO: 导航、元宇宙模式区分
      })
    }
  },

  searchCancel() {
    this.setData({
      showSearch: false,
      searchVal: '',
      searchRes: []
    }, () => {
      this.getScrollCtx();
    })
  },

  searchClear() {
    this.setData({
      searchVal: '',
      searchRes: []
    })
  },

  shopSearch() {
    let searchList = this.allShopList.filter((item) => {
      let boo = false;
      if (this.data.searchVal && item.name.toLowerCase().indexOf(this.data.searchVal.toLowerCase()) != -1) {
        // this.data.searchVal.split('').forEach((item2) => {
        //   if (item.name.indexOf(item2) != -1) {
        //     boo = true
        //   }
        // })
        boo = true
      }
      return boo
    })
    let buildingList = JSON.parse(JSON.stringify(this.data.pickerList))
    let firstSortList = JSON.parse(JSON.stringify(this.firstSortList))
    buildingList.forEach((item) => {
      item.firstSortList = [];
      item.types.forEach((item4, index) => {
        item.firstSortList[index] = {
          key: item4,
          value: ServerConfig.types[0][item4].name,
          shopList: []
        }
        searchList.forEach((item2) => {
          let boo = false;
          let boo2 = false;
          if (item2.location.substring(0, 4) == item.key.substring(0, 4)) {
            boo = true;
          }
          let logo = null;
          item2.type.forEach((item3) => {
            if (item3.substring(0, 4) == item4.substring(0, 4)) {
              boo2 = true;

              logo = logo || ServerConfig.types[1][`${item3.substring(0, 8)}0000`]?.logo || ServerConfig.types[0][`${item3.substring(0, 4)}00000000`]?.logo
            }
          })
          item2.logo = item2.logo || logo;
          if (boo && boo2) {
            item.firstSortList[index].shopList.push(item2)
          }
        })
      })
    })
    // console.log('arr1', buildingList)
    this.setData({
      searchRes: buildingList
    })
  },

  closeLayer() {
    this.clsvk.resetCount();
    if (this.data.firstLocate) {
      this.setData({
        showScan: false,
        showLocateFail: false,
        // shopFold: false,
        scanStatus: 'nav',
        navigating: false,
      }, () => {
        this.setData({
          shopFold: false,
        })
      })
      this.clsvk.pause();
      return;
    }
    this.setData({
      showExit: true
    })


  },

  exitScan() {
    this.setData({
      showExit: false,
      showScan: false,
      navigateInfo: '',
      navigating: false,
      navigateEnd: false,
      navigateExit: false,
      firstLocate: true,
      showLocateFail: false,
    }, () => {
      this.setData({
        shopFold: false,
      })
    })
    this.clsvk.pause();
    this.clsvk.cancelContinue();
    this.clsvk.exitNav();
    this.resetStatus();

  },

  continueScan() {
    this.setData({
      showExit: false
    })
  },

  openAbnormalText() {
    this.setData({
      showAbnormalText: true
    })
    if (this.abnormalTimeout) {
      clearTimeout(this.abnormalTimeout);
      this.abnormalTimeout = null;
    }
    this.abnormalTimeout = setTimeout(() => {
      this.setData({
        showAbnormalText: false
      })
    }, 3000)
  },

  confirmBegin() {
    this.separateLib = true;
    this.clsvk.locateSuccess = false;
    this.clsvk.resetCls(null, null, this.resetFloorCode) // TODO
    this.clsvk.resume();
    this.setData({
      showFloorJudge: false,
      firstLocate: false
    })
  },

  confirmSelf() {
    this.separateLib = true;
    this.setData({
      // showFloorJudge: false,
      floorFold: false
    })
  },

  resetStatus() {
    this.setData({
      firstLocate: true,
      showAbnormal: false,
      showAbnormalSuccess: false
    })
    this.separateLib = false;
  },

  swipeClose(event) {
    console.log('event---', event);
    const { position, instance } = event.detail;
    switch (position) {
      case 'left':
      case 'cell':
      case 'outside':
        instance.close();
        break;
      case 'right':
        // instance.close();
        break;
    }
  },
  swipeClick(event) {
    console.log('click---', event)
  },

  openShopShare(e) {
    if (this.data.showShopShare) {
      this.setData({
        showShopShare: false,
        // currentSharePoi: null
      })
      return
    }
    let poi = e.currentTarget.dataset.poi;
    this.setData({
      showShopShare: true,
      currentSharePoi: poi
    })
  },

  openAcceptShare() {
    if (this.data.showAcceptShare) {
      this.setData({
        showAcceptShare: false,
        // acceptPoi: null,
        shopFold: false
      })
      // this.openGuide();
      return
    }
    this.setData({
      showAcceptShare: true,
      acceptPoi: this.targetPoi
    })
  },

  getSharePosition() {
    this.clsvk.getTargetInfo();
    this.searchCancel()
    this.setData({
      showScan: true,
      scanStatus: 'share',
      shopFold: true,
      floorFold: true,
    })
  },

  againSharePosition() {
    this.openShopShare();
    this.getSharePosition();
  },

  goAcceptPoi() {
    this.openAcceptShare();
    this.startNav();
  },

  openGuide() {
    if (wx.getStorageSync('shareGuide')) return;
    wx.setStorageSync('shareGuide', true)
    this.setData({
      showShareGuide: true
    }, () => {
      setTimeout(() => {
        this.selectComponent('#swipe-cell-guide').open({ position: 'right' });
      }, 1000)
    })
  },

  closeGuide() {
    this.setData({
      showShareGuide: false
    })
  },

  swipeGuideClick() {
    this.closeGuide();
  },

  goFb() {
    wx.navigateTo({
      url: '/pages/feedback/feedback',
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

    this.navReport.exitNav();
    if (this.audio) {
      this.audio.destroy()
      this.audio = null
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {


  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (e) {
    console.log('share---', e);
    let config = {
      appKey: ServerConfig.appKey,
      appSecret: ServerConfig.appSecret,
      mallId: ServerConfig.mallId,
      uuid: ServerConfig.uuid,
      routeId: ServerConfig.routeId,
    }
    let title = '';
    if (e.from == 'button') {
      config.poi = this.data.currentSharePoi;
      if (this.data.currentSharePoi.distance && this.data.currentSharePoi.distance <= this.data.cubeDistance) {
        title = `我在${this.locations.name}${this.data.currentSharePoi.name}附近${this.data.currentSharePoi.distance}米等你哦，快开启AR导航来找我吧！`
      } else if (this.data.currentSharePoi.distance && this.data.currentSharePoi.distance > this.data.cubeDistance) {
        title = `我在${this.locations.name}等你哦，快开启AR导航来找我吧！`
      } else {
        title = `我在分享 ${this.data.currentSharePoi.name} 位置给你，快开启AR导航前往吧！`
      }
    }
    return {
      title: title,
      path: `/packageNav/pages/nav/nav?shareConfig=${encodeURIComponent(JSON.stringify(config))}`,
      imageUrl: 'https://sightppp.oss-cn-shanghai.aliyuncs.com/projects/ARNav/share_img.jpg'
    }
  },

  onPosterStart: function () {
		console.log("onPosterStart");
		wx.showLoading({ title: "拍照中", mask: true });
	},
	onPosterFinish: function () {
		console.log("onPosterFinish");
		// wx.hideLoading();
	},
	onPosterFail: function (e) {
		console.log("onPosterFail", e);
		this.setData({
			showTakePhoto: true
		})
	},
	onPosterSaveTemp: function (e) {
		console.log("onPosterSaveTemp", e.detail);
		wx.hideLoading();
		this.setData({
			posterSources: null,
			photo: e.detail,
			showPhotoLayer: true,
		});
	},
	onPosterSaved: function () {
		wx.showToast({ title: "保存成功" });
	},
	onPosterSaveError: function () {
		wx.showToast({ title: "保存失败", icon: "none"});
	},

	// savePoster: function () {
	// 	this.setData({ save: true });
  // },
  savePoster() {
    wx.downloadFile({
      url: 'https://sightppp.oss-cn-shanghai.aliyuncs.com/projects/MBenz/poster.jpg',
      success:(res)=>{
        console.error('海报详情',res);
        if (res.statusCode === 200) {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success (res) {

            },
            fail(err) {
              console.error('下载海报失败',err);
              wx.showToast({
                icon:"none",
                title:"保存海报失败,请重试!",
                duration:2000
              })
            }
          })
        }
      },
      fail:(err) =>{
          wx.showToast({
            icon:"none",
            title:"保存失败请重试!",
            duration:2000
          })
      }
    })
  }, 
	savePhoto() {
		///点击“保存图片”
		let _this = this;
		wx.showLoading({
			title: "保存中",
			mask: true,
		});
		wx.saveImageToPhotosAlbum({
			filePath: this.data.photo,
			success(res) {
				wx.hideLoading();
				wx.showToast({
					title: "保存成功！前往相册查看您的商户优惠",
					icon: "none",
					duration: 3000,
				});
				_this.setData({
					showPhotoLayer: true,
        });
        _this.savePoster()
			},
			fail(err) {
				wx.hideLoading();
				wx.showToast({
					title: "保存失败",
					icon: "none",
				});
			},
		});
	},
	resetPhoto() {
		this.setData({
			showPhotoLayer: false,
			showTakePhoto:true
		})
	},
	takePic() {
    const cameraContext =  wx.createCameraContext()
    const info = wx.getWindowInfo()
		console.log('has take');
    this.setData({
			showTakePhoto: false,

      posterSources: [
        {
          type: "camera",
          cameraContext:cameraContext,
          x: 0,
          y: 0,
          w: this.data.posterWidth,
          h: (784 * info.windowWidth) / 750,
          fit: {
            mode: "cover",
            coverXRatio: 0.5,
            coverYRatio: 0.5,
            coverXOffset: 0,
            coverYOffset: 0,
          },
        },
      ],
      
      save: true,
    });
  },

})