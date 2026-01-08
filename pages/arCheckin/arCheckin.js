// pages/arCheckin/arCheckin.js
const { POI_LIST } = require('../data/poi.js');

Page({
  data: {
    currentTab: 'checkin',
    checkinPoiList: [],
    progressPercent: 0,
    showPopup: false,
    showAward: false,
    currentPoi: {},
  },
  onLoad() {
    this.initCheckinList();

  },

  // 初始化打卡列表：从 POI_LIST 里筛选 category 包含 arCheckin 的点位
  initCheckinList() {
    // 示例：以后你可以从服务器或本地存储拿到已完成 id 列表
    const doneIds = []; // ['poi_ky_temple'];  // 测试一下“已打卡”状态

    const checkinPoiList = POI_LIST
      .filter(p => p.categories && p.categories.includes('arCheckin'))
      .map((p, idx) => {
        const status = doneIds.includes(p.id) ? 'done' : 'todo';
        return {
          ...p,
          status,
          displayIndex: this.formatIndex(idx + 1)
        };
      });

    const total = checkinPoiList.length;
    const doneCount = checkinPoiList.filter(p => p.status === 'done').length;
    const progressPercent = total > 0 ? Math.round(doneCount * 100 / total) : 0;

    this.setData({
      checkinPoiList,
      progressPercent
    });
  },

  // 格式化序号，比如 01 / 02
  formatIndex(n) {
    return n < 10 ? `0${n}` : `${n}`;
  },

  // WXML 里如果想直接用 {{item.displayIndex}} 就不需要过滤器了
  // 这里给 onTapCheckinCard 用
  onTapCheckinCard(e) {
    const id = e.currentTarget.dataset.id;
    const poi = this.data.checkinPoiList.find(p => p.id === id);
    if (!poi) return;
    this.setData({
      currentPoi: poi,
      showPopup: true
    });
  },

  onClosePopup() {
    this.setData({
      showPopup: false,
      showAward: false,
      currentPoi: {},
    });
  },

  // 点击遮罩
  onMaskTap() {
    this.onClosePopup();
  },

    // 阻止弹窗内部点击冒泡关闭
    onPopupTap() {
      // 空函数即可
    },
    onCheckin() {
      const { currentPoi, checkinPoiList } = this.data;
      // onStartNav();
      // return;
      if(this.data.progressPercent === 100){
        return;
      }
      // 1. 更新列表里当前这个点的 status
      const newList = checkinPoiList.map(p => {
        if (p.id === currentPoi.id) {
          return { ...p, status: 'done' };
        }
        return p;
      });
    
      // 2. 重新算进度
      const total = newList.length;
      const doneCount = newList.filter(p => p.status === 'done').length;
      const progressPercent = total > 0 ? Math.round(doneCount * 100 / total) : 0;
      console.log(progressPercent)
      // 3. 更新界面（必要）
      this.setData({
        checkinPoiList: newList,
        progressPercent,
        currentPoi: { ...currentPoi, status: 'done' },
      });
    },
    onGetReward() {
      this.setData({
        showAward: true
      })
    },
    onSaveToLocal() {
      const that = this;
      const imgUrl = this.data.awardImage; // 你的图片地址（可以是网络图）
    
      wx.showLoading({
        title: '保存中...',
        mask: true
      });
    
      // 先把图片转成本地临时文件
      wx.getImageInfo({
        src: "https://shanghai-mashu-wxapp.oss-cn-shanghai.aliyuncs.com/ui/zhengding/checkin/checkin-awardl.png",
        success(res) {
          wx.saveImageToPhotosAlbum({
            filePath: res.path,
            success() {
              wx.hideLoading();
              wx.showToast({
                title: '已保存到相册',
                icon: 'success'
              });
              that.setData({
                showAward: false
              });
            },
            fail(err) {
              wx.hideLoading();
              // 用户拒绝授权时，引导去设置里打开
              if (err.errMsg.includes('auth deny') || err.errMsg.includes('auth denied')) {
                wx.showModal({
                  title: '需要授权',
                  content: '请在设置中允许保存到相册权限',
                  success(res) {
                    if (res.confirm) {
                      wx.openSetting({});
                    }
                  }
                });
              } else {
                wx.showToast({
                  title: '保存失败',
                  icon: 'none'
                });
              }
            }
          });
        },
        fail() {
          wx.hideLoading();
          wx.showToast({
            title: '图片获取失败',
            icon: 'none'
          });
        }
      });
    },
    
    // 开启导航（先简单跳转，后续你接 AR 逻辑）
    onStartNav() {
      const { currentPoi, checkinPoiList } = this.data;
      if (!currentPoi) return;
      console.log(currentPoi.id);
      if (currentPoi.poi < 70000) return;
      if (currentPoi.arrived !== 2) return;
      this.enterAR();
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
            ? `../../packageNav/pages/nav/nav?targetPoi=${target.poi}&module=arCheckin`
            : `../../packageNav/pages/nav/nav`;
            console.warn("enterAR " + url);
          wx.navigateTo({ url });
        })
         .catch(err => {
           console.warn("enterAR permissions failed:", err);
           wx.showToast({ title: "未获得必要权限", icon: "none" });
         });
    },
  // 底部 Tab 切换（和 index 页同一套逻辑）
  onChangeTab(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === this.data.currentTab) return;

    if (tab === 'home') {
      wx.redirectTo({
        url: '/pages/index/index'
      });
    } else if (tab === 'checkin') {
      // 当前页，不动
    } else if (tab === 'history') {
      wx.redirectTo({
        url: '/pages/arHistory/arHistory'
      });
    }
  }
});
