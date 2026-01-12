import { IS_DEVTOOLS } from '../../utils/util';

// 从插件中引入
const {RoadServer, loadScriptFromString, tinyAllinone } = requirePlugin('SPARPlugin');
// 从插件 tinyAllinone 对象引入需要使用的对象
const { ARManager, TinyLuncher, LoadCondition, TinyRootType, AssistantPlugin, initNavSystem, NavManager } = tinyAllinone;
const { ServerConfig, Config } = require('../../service/config');
import App from "../../app";
const enhanceDevtools = Config.enhanceDevtools;
const wxapp = getApp()
// ARManager.instance.logger.setLevel(3); 

Component({
  properties: {
    firstLocate: {
      type: Boolean,
      value: false
    }
  },

  poiList:null,
  nearPoi:null,

  data: {
    wxapi: wx,
    canvasW: App.getApp().canvasWidth,
    canvasH: App.getApp().canvasHeight,
    canvasT: 0,
    canvasL: 0,
    // enhanceDevtools: undefined === ServerConfig.enhanceDevtools ? Config.enhanceDevtools : ServerConfig.enhanceDevtools,
    enhanceDevtools: enhanceDevtools,

    running: false,
    minInterval: 1000, // 识别间隔
    motion: true,

    count: 0,

    showScan: true,

    load3d: false,
    // projectUrl: 'https://sightppp.oss-cn-shanghai.aliyuncs.com/projects/ARNav/model3D/marketnav_20',
    // sceneFileName: '1338891.json',
    projectUrl: 'https://sightppp.oss-cn-shanghai.aliyuncs.com/projects/ARNav/model3D/nav_blank_01',
    sceneFileName: '1502236.json',
    "fackDataConfig": {
      "host": "https://wenlvlocsim.easyar.com",
      "filename": "changtai_f1tob1_jibao",
      "startIndex": 50,
      "autoUpdate": true,
      "useRemoteSet": false
    },
    loadNetworkScripts: { console, setTimeout, clearTimeout },
    // loadScripts,
    showVkClient: false,
    showClsClient: false,
    vkDebug: false, // 是否显示clsvkclient调试信息 默认关闭
    autoLocate: false, // 是否开启gps定位 默认关闭
    enableAR: true, // 是否开启相机（是否开启vk）
  },
  lifetimes: {
    created: function () { },
    attached() {
      this.onLoad();
    },
    detached() {
      this._detached();
    },
  },
  methods: {
    _detached() {
      if (this.navManager) {
        this.navManager.destroy();
      }
      if (this.tinyLuncher) {
        this.tinyLuncher.destroy();
      }
    },
    onLoad: async function (options) {
      // wx.showLoading({
      //   title: '',
      //   mask: true
      // })
      await wxapp.initEasyARPluginPromise;
      wx.setKeepScreenOn({
        keepScreenOn: true,
      });

      this.roadServer = new RoadServer({
        "appkey": ServerConfig.appKey,
        "appSecret": ServerConfig.appSecret,
        "host": "https://dijkstra-server-api.easyar.com"
      });

      if (ServerConfig.useMultiMap) {
        this.roadServer.getConfig(ServerConfig.routeId).then((data) => {
          this.setData({
            multiMapSetting: {
              useMultiMap: true,
              multiMapConfig: data.config.blocks
            },
          })
        }).catch(e => {
          console.error(e);
          debugger
        })
      } else {
        this.setData({
          multiMapSetting: {
            useMultiMap: false
          }
        })
      }

      this.setData({
        clsConfig: {
          "apiKey": ServerConfig.localize.apiKey,
          "apiSecret": ServerConfig.localize.apiSecret,
          "clsAppId": ServerConfig.localize.clsAppId,
          "arannotationId": ServerConfig.localize.annotationId,
          "serverAddress": ServerConfig.localize.clsAppEndpointUrl,
          "serviceType": ServerConfig.localize.ext?.type == 2 ? 'landmark' : 'block'
        }
      })
      // console.log("arannotationId", ServerConfig.localize.annotationId)

      const sysInfo = this.sysInfo = wx.getSystemInfoSync(); // 放在此处调用，规避主程序windowHeight不确定性
      this.setData({
        canvasW: sysInfo.windowWidth,
        canvasH: sysInfo.windowHeight,
        showVkClient: true,
        // showClsClient: !ServerConfig.vkSupport,
        vkDebug: false,//ServerConfig.vkDebug || false,
        blacklist: ServerConfig.wxBlacklist || getApp().globalConfig?.wxBlacklist || {}
      })

      // TODO 模拟 IS_DEVTOOLS=true 时，主动触发相关函数
      // 抹平开发者工具和真机流程差异
      if (IS_DEVTOOLS) {
        this.setData({
          enhanceDevtools: true
        })
        // setTimeout(() => {
        //   this.triggerEvent('loaded', { ctx: this });
        // }, 2000);
      } else {
        // 真机取值于后台和config/config中的取值，开启:`gulp mock-enable`；关闭:`gulp mock-disable`；
        // this.setData({
        //   enhanceDevtools: false
        // })
        if (this.data.enhanceDevtools) {
          this.setData({
            "fackDataConfig": Object.assign({
              "host": "https://wenlvlocsim.easyar.com",
              "filename": "yuanqu2022_05_30_181348_meif",
              "startIndex": 0,
              "autoUpdate": true,
              "useRemoteSet": false
            }, ServerConfig.fackDataConfig),
          })
        }
      }
    },
    // 路网已加载，可以开启导航
    navReady() {
      if (!this.targetPoi) return;
			let arannotations = this.clsclient.self.clsdata.ema.annotations
      console.log('arannotations:', arannotations.count)
      let arr = [];
      if (this.targetPoi.position) {
        arr = [this.targetPoi]
      } else {
        arannotations.forEach((item) => {
          if (this.targetPoi.kind == 2 && item.properties?.name.indexOf(this.targetPoi.keyWord) != -1) {
            arr.push(Object.assign({}, this.targetPoi, { name: item.properties.name }, item.transform));
          }
          if (this.targetPoi.kind != 2 && this.targetPoi.annotation && this.targetPoi.annotation.indexOf(item.id) != -1) {
            arr.push(Object.assign({}, this.targetPoi, item.transform));
          } else if (this.targetPoi.kind != 2 && this.targetPoi.name == item.properties?.name) {
            arr.push(Object.assign({}, this.targetPoi, item.transform));
          }
        })
      }

      this.targetPoiArr = arr;
      // console.log('targetPoiArr', this.targetPoiArr)
      this.userReady = true; // 用户开始导航判断条件，用来开启导航，开启后设为false
    },
    // 接收目的地信息
    getTargetInfo(target) {
      // console.log('target', target)
      this.targetPoi = target;
      this.locateSuccess = false;
      this.resume();
    },
    // 接收当前楼层信息
    resetCls(routeId, mapId, floor) { // TODO: 多图库使用方法，待改造
      if (floor) {
        let data = ServerConfig.mapConfig.find((item) => {
          return item.location == floor
        })
        this.setData({
          clsConfig: {
            "apiKey": ServerConfig.apiKey,
            "apiSecret": ServerConfig.apiSecret,
            "clsAppId": data.clsAppId,
            "arannotationId": data.arannotationId
          }
        })
      } else {
        // 元宇宙根据地图切换场景, 需要playcanvas端配合处理
        // this._app3d.fire('showSceneByID', mapId);
      }

      // this.navReady()
    },
    metaLocate() {
      this.resume()
    },
    pause() {
      this.setData({ running: false });
    },
    resume() {
      this.setData({ running: true });
    },

    vkChange(val) {
      if (!val) {
        this.locateCount = 0;
        this.vkChangeStatus = true;
        this.locateSuccess = false;
        this.triggerEvent('vkchange')
      }
    },
    resetCount() {
      this.locateCount = 0;
    },
    // spar-clsvkclient
    onClsVKClientLoad(e) {
      let { clsClientContext, VKSessionContext, PCContext } = e.detail;
      console.log("onClsVKClientLoad", e.detail);
      this.clsclient = e.detail.clsClientContext;
      this.vkCtx = VKSessionContext;
      this.pcCtx = PCContext;

      this._pc = this.pcCtx.pc;
      this._app3d = this.pcCtx.app;
      this._camera3d = this.pcCtx.camera;
      this._canvas3d = this._app3d.graphicsDevice.canvas;
      this._gl = this._app3d.graphicsDevice.gl;

      this.ema = VKSessionContext.self.clsdata.ema;
			this.annotations = this.ema.annotations;
			console.log("arannotations:",this.annotations);

      console.log("this.pcCtx;",this.pcCtx,ARManager.instance)
      console.log("this.vkCtx;",this.vkCtx)
      wxapp.globalData.poster.photoApp = this.pcCtx.app;
      wxapp.globalData.poster.PCContext = this.pcCtx;
      wxapp.globalData.poster.photoManager = ARManager.instance;

      wx.hideLoading();
      this.initTinyLuncher();
      this.initNav();

      this.triggerEvent('loaded', { ctx: this });

      if (ServerConfig.gps?.simulator) {
        ARManager.instance.clsClient.setGeoLocationInput("Simulator", ServerConfig.gps?.latitude ? {
          latitude: ServerConfig.gps.latitude,
          longitude: ServerConfig.gps.longitude,
        } : null)
      }
    },

    initTinyLuncher() {
			console.log("TinyLuncher---",TinyLuncher);
      this.tinyLuncher = TinyLuncher.Instance;
      this.tinyLuncher.init(this._pc, this._app3d, loadScriptFromString);

      this.emaTinyRoot = this.tinyLuncher.instantiateFromAnotation(
        {
          type: "Annotation",
          ema: this.ema
        });
      console.log('emaTinyRoot:',this.emaTinyRoot)

    },

    initModel(arId, url){
      let e = this.emaTinyRoot.rootEntity.findByGuid(arId)
      console.log("找到 entity：", e.name);
      if (!e.script) {
        e.addComponent("script");
      }
      if (!e.script.has("sdsTinyRootHandler")) {
        e.script.create("sdsTinyRootHandler", {
          attributes: {
            type: "TinyAPP",
            tinyAppUrl: url,//"https://sightp-tour-tiny-app.sightp.com/TestTiny_Shuziren--2023_8_15-20_8_33/tinyapp.json",
          
            loadCondition: "manual",
            showCondition: "auto"
          },
        });
      }

      let manualTinyRoot = this.tinyLuncher.findTinyRoot(e);
      console.log('manualTinyRoot', manualTinyRoot);
      if (manualTinyRoot) {
        manualTinyRoot.load(() => {
          console.log("loaded a tiny app")
        });
      } else {
        e.on("inited", (manualTinyRoot) => {
          console.log("接受到消息： inited")
          manualTinyRoot.load(() => {
            console.log("loaded a tiny app")
          });
        })
      }
    },

    setModelActive(arId, active){
      let e = this.emaTinyRoot.rootEntity.findByGuid(arId)
      if (!e.script) return;
      if (!e.script.has("sdsTinyRootHandler")) return;
      let manualTinyRoot = this.tinyLuncher.findTinyRoot(e);
      if (manualTinyRoot){
        if(manualTinyRoot._active !== active)
          manualTinyRoot.setActive(active);
      }
    },

    initNav() {
			console.log("NavLuncher---");
      let navSetting = Object.assign(ServerConfig.vkSupport ? ServerConfig.navSettingIOS || {} : ServerConfig.navSettingAndroid || {}, {
        id: ServerConfig.routeId,
        requestRoute: this.roadServer.getRoute,
        modelTinyApp: {
          routeModels : "https://tiny-app.gindxrstu.com/Default-zhengding/tinyapp.json",
          targetFinderModel : "https://tiny-app.gindxrstu.com/TargetFinder2-ZD/tinyapp.json",
          navigatorModel : "https://tiny-app.gindxrstu.com/ZhonglingShuZiRen/tinyapp.json"
        }
      })
      console.log('navSetting', navSetting)

      this.navManager = initNavSystem(this._pc, this._app3d, navSetting, wx);
      // navSetting.modelTinyApp.routeModels = ''
      // 导航消息，每秒触发
      this.navManager.on("nav_message", (data) => {
        this.triggerEvent('message', { data });
        // console.log('poiList', this.poiList, 'annotations', this.annotations)
        if(this.poiList === null) return;
        if(this.annotations === null) return;
        let nearestPoi = null;
        let nearestDis = 10000;
        if(!this.poiList.length) return
        for (let i = 0; i < this.poiList.length; i++) {
          let poi = this.poiList[i];
          let position1 = data.activeMarkers?.[0]?._position
          if(position1){
            let arId = poi.arannotationId;
            if(arId){
              let arPoi = this.annotations.find(p => p.id === arId);
              if(arPoi){
                let position2 =
                arPoi.position ||
                (arPoi.transform && arPoi.transform.position) ||
                { x: arPoi.x, y: arPoi.y, z: arPoi.z };
                if (position2 && position2.x != null) {
                  const d = this.distance3D(position1, position2);
                  // console.log(poi.name, 'dis:', d);
            
                  if (d < nearestDis) {
                    nearestDis = d;
                    nearestPoi = poi;
                  }
                }
              }
            }
          }

          if (poi.loaded) continue;
          this.poiList[i].loaded = true;
          try {
            console.log('initModel', poi.arannotationId, poi.modelUrl)
            this.initModel(poi.arannotationId, poi.modelUrl);
          } catch (e) {
            console.warn('处理POI失败', poi, e);
          }
        }
        console.log('nearestPoi:',nearestPoi,'nearestDis',nearestDis);
        if(nearestDis > 20){
          this.nearPoi = null;
        }else{
          this.nearPoi = nearestPoi;
        }

        for (let i = 0; i < this.poiList.length; i++) {
          let poi = this.poiList[i];
          if(this.nearPoi && this.nearPoi.poi === poi.poi)
            this.setModelActive(poi.arannotationId, true);
          else
            this.setModelActive(poi.arannotationId, false);
        }

        // if (position1) {
        //   let d = this.distance3D(position1, position2)
        //   console.log('position1:',position1,'position2',position2,'distance:', d)
        // }
        // console.log('nav_message', data);
      });
      // 导航到达
      this.navManager.on("nav_arrive", (data, sign) => {
        // TODO
        this.triggerEvent('arrived', { data, sign });
        this.targetPoi = null;
        this.targetPoiArr = null;
        if (this.vkCtx) {
          this.vkCtx.clearFusion();
        }
      });
      // 重新规划路线
      this.navManager.on("nav_resetRoute", () => {
        // TODO
        this.triggerEvent('reset')
      });
      // 用户持续偏离路线
      this.navManager.on("nav_maxRetryCount", () => {
        this.locateSuccess = false;
        if (this.vkCtx) {
          this.vkCtx.clearFusion();
        }
      });
      this.navManager.on('nav_break', (data) => {
        debugger
        this.locateSuccess = false;
        if (this.vkCtx) {
          this.vkCtx.clearFusion();
        }
        this.triggerEvent('navbreak', { data })
      })
    },

    async doSomething(poi) {
      // 示例：延时模拟
      // return new Promise(r => setTimeout(r, 100));
    },

//计算距离
     distance3D(a, b) {
      const dx = (a.x ?? 0) - (b.x ?? 0)
      const dy = (a.y ?? 0) - (b.y ?? 0)
      const dz = (a.z ?? 0) - (b.z ?? 0)
      return Math.sqrt(dx*dx + dy*dy + dz*dz)
    },
    //获取ar画面
    takeARSnapshot({ ext = 'jpg', quality = 0.85 } = {}) {
      // return new Promise((resolve, reject) => {
      //   if (!this._app3d || !this._canvas3d) {
      //     return reject(new Error('AR Canvas 未就绪'))
      //   }
    
      //   // 等一帧，保证截到最新画面（postrender）
      //   const handler = () => {
      //     try {
      //       this._app3d.off?.('postrender', handler)
    
      //       const mime = ext === 'png' ? 'image/png' : 'image/jpeg'
      //       const dataUrl = this._canvas3d.toDataURL(mime, quality)
      //       const base64 = dataUrl.split(',').pop()
      //       // console.log('base64:',base64)
      //       if (!base64) throw new Error('toDataURL 失败')
    
      //       const filePath = `${wx.env.USER_DATA_PATH}/ar_${Date.now()}.${ext}`
      //       wx.getFileSystemManager().writeFile({
      //         filePath,
      //         data: base64,
      //         encoding: 'base64',
      //         success: () => resolve(filePath),
      //         fail: reject
      //       })
      //     } catch (e) {
      //       reject(e)
      //     }
      //   }
    
      //   this._app3d.on('postrender', handler)
      // })
    },
    

    onResize(e) {
      this.setData(e.detail);
    },
    once() {
      if (this.clsclient) {
        let canRun = false
        if (canRun = this.clsclient.run()) {
          console.log('running', canRun)
        }
      }
    },

    // spar-clsvkclient
    onClsVKClientResult(e) {
      console.log("onClsVkClientResult", e.detail);
      this.triggerEvent('vkready', typeof(e.detail.statusCode) == 'number'); // vio是否初始化完成
      if (e.detail.statusCode == 0) {
        this.triggerEvent('result', e.detail);
        this.locateCount = 0;
        this.vkChangeStatus = false;
        if (!this.locateSuccess) {
          this.locateSuccess = true;
          // this.getFloor(e.detail.result.mapId);
          this.triggerEvent('locate', e.detail);
          if (ServerConfig.clsSplit && this.data.firstLocate) {
            return;
          }
          if (this.continueStatus) {
            this.continueStatus = false;
            debugger
            this.navManager.fire('nav_continue');
            return;
          }
          this.navReady()
        }
        if (this.userReady) {
          // this.triggerEvent('locate', { floor: this.lastFloor })
          this.userReady = false;
          setTimeout(() => {
            this.navManager.baseAssetLoadPromise.then(() => {
              this.navManager.fire("nav_start", this.targetPoiArr);
            })
          }, 500);
        }
      } else {
        if (!this.vkChangeStatus) return;
        if (!this.locateCount && this.locateCount != 0) this.locateCount = 0;
        this.locateCount++
        if (this.locateCount >= 5) {
          this.triggerEvent('fail');
          this.locateCount = 0;
          // this.pause()
        }
      }
    },

    onClsClientError(e) {
      console.log("onClsClientError", e.detail);
      this.setData({
        error: e.detail,
      });
    },

    navContinue() {
      this.continueStatus = true;
      this.locateSuccess = false;
      this.resume()
    },
    cancelContinue() {
      this.continueStatus = false;
    },
    exitNav() {
      this.navManager.fire('nav_cancel');
      this.pause();
      this.targetPoi = null;
      this.targetPoiArr = null;
      if (this.vkCtx) {
        this.vkCtx.clearFusion();
      }
    },
    stopSession() {
      this.setData({
        enableAR: false,
      })
    },
    restartSession() {
      this.setData({
        enableAR: true,
      })
    },
  }
});