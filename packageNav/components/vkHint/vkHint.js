// packageNav/components/vkHint/vkHint.js
import App from "../../app";
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    type: {
      type: String,
      value: 'back' // back: 退出 close: 仅关闭弹窗
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    phoneModel: App.getApp().model,
    showVKno: false,
    showVKModel: false,
    hintCheck: false,
  },
  lifetimes: {
    attached() {
      // if (wx.getStorageSync('hintCheck')) return;
      this.setData({
        showVKno: true //todo:true
      })
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    checkHint() {
      this.setData({
        hintCheck: !this.data.hintCheck
      })
      // wx.setStorageSync('hintCheck', this.data.hintCheck)
    },
  
    openVKModel() {
      this.setData({
        showVKModel: true
      })
    },
  
    closeVKno() {
      if (this.data.type != 'back') {
        this.setData({
          showVKno: false
        })
      } else {
        wx.navigateBack({
          delta: 1
        })
      }
    },
  
    closeVKModel() {
      this.setData({
        showVKModel: false
      })
    },  
  }
})