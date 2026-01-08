// app.js
import { license } from "./utils/config";
const { setLicense, setWxApi, inject } = requirePlugin("SPARPlugin");

App({
  // ✅ 合并 globalData，避免被覆盖
  globalData: {
    poster: {},
    userId: 1,
    userInfo: null
  },

  onLaunch() {
    // 1) 官方隐私授权弹窗（你原来的逻辑保留）
    wx.getPrivacySetting({
      success: (res) => {
        if (res.needAuthorization) {
          wx.onNeedPrivacyAuthorization(({ resolve }) => {
            wx.openPrivacyContract({
              success: () => resolve({ accept: true }),
              fail: () => resolve({ accept: false })
            });
          });
        }
      }
    });

    // 2) EasyAR & SPAR 初始化（你原来的逻辑保留）
    setLicense(license);
    this.initEasyARPluginPromise = this.initEasyARPlugin();
    setWxApi(wx);

    // 3) 读取缓存的 userId（你原来的逻辑保留）
    try {
      const id = wx.getStorageSync("userId") || 1;
      this.globalData.userId = id;
    } catch (_) {}

    // 4) （可选）如果你希望一进小程序就准备定位监听，可在此预热
    //    ——不建议一上来就弹授权，通常在真正需要时再调用 
  },

  async initEasyARPlugin() {
    const easyarEngin = await requirePlugin.async("SPAREngine");
    const easyarCore = await requirePlugin.async("easyar-core");
    inject(easyarEngin, easyarCore);
  },

  /* -------- 相机权限（新增） -------- */
  ensureCameraAuth() {
    return new Promise((resolve, reject) => {
      wx.getSetting({
        success: (s) => {
          if (s.authSetting["scope.camera"]) return resolve();
          wx.authorize({
            scope: "scope.camera",
            success: resolve,
            fail() {
              wx.showModal({
                title: "需要相机权限",
                content: "用于 AR 导航/识别，请在设置中允许“相机”。",
                confirmText: "去设置",
                success: ({ confirm }) => {
                  if (!confirm) return reject(new Error("user cancelled"));
                  wx.openSetting({
                    success: (setRes) => {
                      const ok = setRes.authSetting["scope.camera"];
                      ok ? resolve() : reject(new Error("camera not granted"));
                    },
                    fail: reject
                  });
                }
              });
            }
          });
        },
        fail: reject
      });
    });
  },

});
