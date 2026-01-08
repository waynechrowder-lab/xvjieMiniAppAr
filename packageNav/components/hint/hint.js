// plugin/components/hint/hint.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    scan: {type: Boolean, value: false},
    erect: {type: Boolean, value: false}
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  lifetimes: {
    attached() {
      this.frame = {
        'erect': {
          length: 12,
          interval: 160
        },
        'scan': {
          length: 17,
          interval: 160
        }
      }
      this.currentFrame = 'scan'
      this.index = 0
      // 通过 SelectorQuery 获取 Canvas 节点
      wx.createSelectorQuery().in(this)
      .select('#canvas')
      .fields({
        node: true,
        size: true,
      })
      .exec(this.init.bind(this))
    },
    detached() {
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }
    }
  },

  observers: {
    scan(val) {
      if (!this.imgScanList) return
      if (val) {
        this.currentFrame = 'scan';
        this.imgList = this.imgScanList;
        this.index = 0;
        this.renderLoop()
      } else {
        if (this.interval) {
          clearInterval(this.interval);
          this.interval = null;
        }
      }
    },

    erect(val) {
      if (!this.data.scan || !this.imgScanList) return
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }
      if (val) {
        this.currentFrame = 'erect';
        this.imgList = this.imgErectList;
        this.index = 0;
        this.renderLoop()
      } else {
        this.currentFrame = 'scan';
        this.imgList = this.imgScanList;
        this.index = 0;
        this.renderLoop()
      }
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    init(res) {
      // console.log(res)
      const width = res[0].width
      const height = res[0].height
      this.width = width
      this.height = height
  
      const canvas = res[0].node
      const ctx = canvas.getContext('2d')
      this.ctx = ctx
      this.canvas = canvas
  
      const dpr = wx.getSystemInfoSync().pixelRatio
      this.dpr = dpr
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)
  
      this.loadImg()
      this.imgList = this.imgScanList
      if (this.data.scan) {
        this.renderLoop()
      }
    },

    loadImg() {
      this.imgScanList = [];
      for (let i = 0; i < this.frame['scan'].length; i++) {
        const img = this.canvas.createImage()
        img.onload = () => {
          this.imgScanList[i] = img
        }
        img.src = `https://sightppp.oss-cn-shanghai.aliyuncs.com/projects/ARNav/frame/scan${i}.png`
      }

      this.imgErectList = [];
      for (let i = 0; i < this.frame['erect'].length; i++) {
        const img = this.canvas.createImage()
        img.onload = () => {
          this.imgErectList[i] = img
        }
        img.src = `https://sightppp.oss-cn-shanghai.aliyuncs.com/projects/ARNav/frame/erect${i}.png`
      }
    },

    renderLoop() {
      this.render()
      this.interval = setInterval(() => {
        this.render()
      }, this.frame[this.currentFrame].interval)
    },

    render() {
      // console.log('render-', this.imgList)
      const ctx = this.ctx
      const width = this.width
      const height = this.height
      
      if (!this.imgList[`${this.index}`]) {
        return
      }
      ctx.clearRect(0, 0, width, height)
      // console.log(this.imgList[this.index])
  
      let img = this.imgList[`${this.index++}`];
      ctx.drawImage(img, 0, 0, width, height)
      ctx.restore()

      if (this.index >= this.frame[this.currentFrame].length) {
        this.index = 0;
      }
    },
  }
})
