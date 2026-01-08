// pages/arCheckin/arCheckin.js
const { POI_LIST } = require('../data/poi.js');

Page({
  data: {
    currentTab: 'history',
    checkinPoiList: [],
    progressPercent: 0,
    showPopup: false,
    showAward: false,
    getPrise: false,
    currentPoi: {},
    prizeIndex: 1,
  },

  onLoad() {
    this.initCheckinList();
    this.setData({
      prizeIndex : Math.floor(Math.random() * 5) + 1
    })
  },

  // 初始化打卡列表：从 POI_LIST 里筛选 category 包含 arCheckin 的点位
  initCheckinList() {
    // 示例：以后你可以从服务器或本地存储拿到已完成 id 列表
    const doneIds = []; // ['poi_ky_temple'];  // 测试一下“已打卡”状态

    const checkinPoiList = POI_LIST
      .filter(p => p.categories && p.categories.includes('arHistory'))
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
      currentPoi: {},
      showAward : false
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
      if (!currentPoi || !currentPoi.id) return;
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
    onSaveToLocal(){
      this.setData({
        getPrise: true
      })
    },
    // 开启导航（先简单跳转，后续你接 AR 逻辑）
    onStartNav() {
      const poi = this.data.currentPoi;
      if (!poi) return;
      console.log(poi.id);
      if (poi.poi < 70000) return;
      if (poi.arrived !== 2) return;
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
            ? `../../packageNav/pages/nav/nav?targetPoi=${target.poi}&module=arHistory`
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
      wx.redirectTo({
        url: '/pages/arCheckin/arCheckin'
      });
    } else if (tab === 'history') {

    }
  }
});
