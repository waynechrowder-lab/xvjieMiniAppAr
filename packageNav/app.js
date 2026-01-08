wx.canIUse = () => { }
class App {
  name = ''
  constructor() {
    let sysInfo = wx.getSystemInfoSync();
    const { windowWidth, windowHeight, pixelRatio, platform, model } = sysInfo
    Object.assign(this, { canvasWidth: windowWidth, canvasHeight: windowHeight, pixelRatio, platform, model, sysInfo, rpx2px: 750 / windowWidth })

    this.globalData = {
      statusBarHeight: 0,
      titleBarHeight: 0,
      navBarHeight: 0,
      _navBarHeight: this.sysInfo.statusBarHeight + wx.getMenuButtonBoundingClientRect().height + (wx.getMenuButtonBoundingClientRect().top - this.sysInfo.statusBarHeight) * 2,
    }
  }

  launch(property) {
    const { updateConf, ServerConfig } = require("./service/config");
    const { serverApi: { getSystemSetting, getMallInfo, getProjectSetting } } = require("./service/serverApi");
    return this.globalData.serverConfigPromise = Promise.all([getSystemSetting(), getMallInfo(property), getProjectSetting()]).then(([res, mallRes, projectRes]) => {
      console.log('serverConfigPromise done!')
      try {
        const conf = JSON.parse("{}");
        const custom = res.data || {};
        Object.assign(custom, res.data.platform || {}, mallRes.data, { feedback: projectRes.data.questionFeedback || false });
        updateConf(conf, custom);
        return res;
      } catch (e) {
        console.error('更新远程配置失败', e);
      }
    }).catch(e => {
      console.error('获取远程配置失败', e);
    });
  }
  initGlobalData() {
    wx.getStorage({ key: 'phoneInfo', success: (res) => this.globalData.phoneInfo = res });
  }

  static getApp() {
    return App.app ?? (App.app = new App())
  }
}

export default App;