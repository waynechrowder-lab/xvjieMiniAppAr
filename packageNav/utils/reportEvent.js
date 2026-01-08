/**
 * 导航流程数据上报
 * 上报参数
 * @param {String} mall_name 商场名称
 * @param {String} id_vk openId, vksupport组合字段，用','拼接
 * @param {String} id_time_vk openId, 选择定位时间戳(s), vksupport组合字段，用','拼接 (为了分组数据不合并)
 * @param {String} open_id openId
 * @param {String} vksupport 是否支持SLAM导航
 * @param {String} enter_nav 进入导航页时间
 * @param {Number} load_duration 内容加载耗时(秒)
 * @param {Number} select_duration 选择目的地耗时(秒)	
 * @param {String} target_name 目的地名称	
 * @param {Number} locate_duration 定位成功耗时(秒)	
 * @param {Number} nav_duration 导航过程耗时(秒)	
 * @param {String} break_duration 导航中断耗时(秒)	
 * @param {String} exit_nav 开启导航到退出导航页耗时(秒)
 */
export class NavReport {
  constructor() {
    this.reportCount = 0;
    this.mall_name = ''
    this.open_id = ''
    this.vksupport = ''
    this.enter_nav = 0
    this.exit_nav = 0
    this.resetFlow()
  }

  resetFlow() {
    this.nav_ready = 0
    this.select_target = 0
    this.target_name = ''
    this.locate_success = 0
    this.nav_arrive = 0
    this.nav_break = 0
  }

  setTime(key) {
    this[key] = Date.now();
  }

  setValue(key, val) {
    this[key] = val;
  }

  formatDate(t) {
    const date = new Date(t);
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
  }

  calcDuration(a, b) {
    return parseInt((b - a) / 1000)
  }

  exitNav() {
    if (!this.locate_success) return;
    this.exit_nav = Date.now();
    this.report();
  }

  reportSelect() {
    wx.reportEvent('poi_select', {
      mall_name: this.mall_name,
      open_id: this.open_id,
      vksupport: this.vksupport,
      enter_nav: parseInt(this.enter_nav / 1000),
      load_duration: this.reportCount > 0 ? 0 : this.calcDuration(this.enter_nav, this.nav_ready),
      select_duration: this.calcDuration(this.nav_ready, this.select_target),
      target_name: this.target_name,
      id_time_vk: `${this.open_id}, ${parseInt(this.select_target / 1000)}, ${this.vksupport}`,
    })
  }

  reportLocate() {
    wx.reportEvent('nav_start', {
      mall_name: this.mall_name,
      open_id: this.open_id,
      vksupport: this.vksupport,
      enter_nav: parseInt(this.enter_nav / 1000),
      load_duration: this.reportCount > 0 ? 0 : this.calcDuration(this.enter_nav, this.nav_ready),
      select_duration: this.calcDuration(this.nav_ready, this.select_target),
      target_name: this.target_name,
      locate_duration: this.locate_success ? this.calcDuration(this.select_target, this.locate_success) : 0,
      id_time_vk: `${this.open_id}, ${parseInt(this.select_target / 1000)}, ${this.vksupport}`,
    })
  }

  report() {
    wx.reportEvent('nav_analysis', {
      mall_name: this.mall_name,
      open_id: this.open_id,
      vksupport: this.vksupport,
      id_vk: `${this.open_id}, ${this.vksupport}`,
      enter_nav: parseInt(this.enter_nav / 1000),
      load_duration: this.reportCount > 0 ? 0 : this.calcDuration(this.enter_nav, this.nav_ready),
      select_duration: this.calcDuration(this.nav_ready, this.select_target),
      target_name: this.target_name,
      locate_duration: this.locate_success ? this.calcDuration(this.select_target, this.locate_success) : 0,
      nav_duration: this.nav_arrive ? this.calcDuration(this.locate_success, this.nav_arrive) : 0,
      break_duration: this.nav_break ? this.calcDuration(this.locate_success, this.nav_break) : 0,
      exit_nav: this.locate_success && this.exit_nav ? this.calcDuration(this.locate_success, this.exit_nav) : 0,
      id_time_vk: `${this.open_id}, ${parseInt(this.select_target / 1000)}, ${this.vksupport}`,
    })
    this.resetFlow();

    this.reportCount ++;
  }
}