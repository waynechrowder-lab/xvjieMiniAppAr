// packageNav/components/parking-popup/index.js
const { ServerConfig, Config } = require('../../service/config');
import { getkey,parkingInfo  } from "../../utils/parkingRequest";
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    navigating: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    tabStatus: 'stall',
    activeTab: 'plate', // plate: 车牌搜索; stall: 车位搜索
    plateRes: '', // 车牌号匹配结果
    plateReady: false, // 是否进行了车牌号匹配
    parkingFold: true,
    province: ['京','沪','粤','津','冀','晋','蒙','辽','吉','黑','苏','浙','皖','闽','赣','鲁','豫','鄂','湘','桂','琼','渝','川','贵','云','藏','陕','甘','青','宁','新'],
    keyboard: ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F','G','H','J','K','L','M','N','P','Q','R','S','T','U','V','W','X','Y','Z','港','澳','台','学','临','试','警','消','森','边','领','使'],
    carNumArr: [],
    carProvince: '',
    numLengthLimit: 6, // 6: 油车; 7: 新能源车
    provinceKeyboard: true,
    numKeyboard: false,

    tags: [],
    activeTag: '',
    buildingList: [],
    searchVal: '',
    showSearch: false,
		stallLength: 20,
		mapName:'',
		parkingSpaceNumber:''
  },

  lifetimes: {
    created: function () {},
    attached() {
			getkey()
      if (ServerConfig.carNumberSearch && ServerConfig.parkingPlaceSearch) {
        this.setData({
          tabStatus: 'all',
          activeTab: 'plate'
        })
      } else if (ServerConfig.carNumberSearch) {
        this.setData({
          tabStatus: 'plate',
          activeTab: 'plate'
        })
      } else if (ServerConfig.parkingPlaceSearch) {
        this.setData({
          tabStatus: 'stall',
          activeTab: 'stall'
        })
      }
      this.triggerEvent('loaded', { ctx: this });
      this.initMallData()
      this.debounceSearch = this.debounce(this.shopSearch, 200)
    },
    detached() {
      
    },
  },
  observers: {
    'activeTab, showSearch': function(activeTab, showSearch) {
      if (activeTab == 'stall' && !showSearch) {
        setTimeout(() => {
          this.getScrollCtx()
        }, 500)
        // this.getScrollCtx()
      }
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getScrollCtx() {
      this.createSelectorQuery()
        .select('#scrollview')
        .node()
        .exec((res) => {
          this.scrollView = res[0].node;
        })
    },
    initMallData() {
      this.locations = ServerConfig.locations.find((item) => {
        return ServerConfig.mallId == item.id;
      })
      this.setData({
        mallName: this.locations.name
      })
      let arr = [];
      Object.keys(this.locations.buildings).forEach((item) => {
        let obj = {
          key: item,
          value: this.locations.buildings[item].name
        }
        arr.push(obj)
      })
      this.setData({
        buildingList: arr,
        activeBuilding: arr[0].key,
        activeBuildingName: arr[0].value,
      })
      this.currentBuilding = arr[0] // 当前选择楼栋
      this.initBuildingData()
    },
  
    selectBuilding(e) {
      const index = e.currentTarget.dataset.index;
      if (this.data.activeBuilding == this.data.buildingList[index].key) return;
      this.currentBuilding = this.data.buildingList[index];
      this.setData({
        activeBuilding: this.data.buildingList[index].key
      })
      this.initBuildingData()
    },
  
    initBuildingData() {
      let arrFloor = [];
      let arrShop = [];
      let floorList = [];
      let allFloorList = [];

      // 当前楼栋楼层列表
      Object.keys(this.locations.floors).forEach((item, index) => {
        if (item.substring(0, 4) == this.currentBuilding.key.substring(0, 4)) {
          let obj = {
            key: item,
            value: this.locations.floors[item]
          }
          arrFloor.push(obj);
        }
        let obj = {
          key: item,
          value: this.locations.floors[item]
        }
        allFloorList.push(obj);
      })
      // 当前楼栋所有楼层
      this.arrFloor = arrFloor;
      // 所有楼栋所有楼层
      this.allFloorList = allFloorList;
      // 当前楼栋所有店铺
      arrShop = ServerConfig.spots
  
      let shopList = arrShop.filter((item) => {
        return item.location.substring(0, 4) == this.currentBuilding.key.substring(0, 4)
      })
  
      this.shopListArr = shopList; // 当前楼栋店铺
      this.allShopList = arrShop; // 所有楼栋店铺

      this.arrFloor.forEach((item) => {
        let boo = false;
        this.shopListArr.forEach((item2) => {
          if (item2.location == item.key) {
            boo = true;
          }
        })
        if (!boo) return;
        floorList.push(item)
      })
      this.setData({
        floorList: floorList,
        activeFloor: floorList[0].key
      })
  
      this.getTags();
  
      this.findShop();
  
      // this.setData({
      //   floorList: arrFloor
      // })
    },
  
    getTags() {
      let tags = [];
      
      Object.keys(ServerConfig.types[1]).forEach((item) => {
        let boo = false
        this.shopListArr.forEach((item2) => {
          item2.type.forEach((item3) => {
            if (item3.substring(0, 8) == item.substring(0, 8) && item2.location == this.data.activeFloor){
              boo = true;
            }
          })
        })
        if (!boo) return;
        let obj = {
          key: item,
          value: ServerConfig.types[1][item].name,
        }
        tags.push(obj)
      })
      
      this.setData({
        tags: tags,
      })
    },
  
    debounce(func,wait) {
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
    findShop() {
      let list = this.shopListArr.filter((item) => {
        // 判断是否属于当前中类
        let boo2 = false;
        item.type.forEach((item3) => {
          if (item3.indexOf(this.data.activeTag.substring(0, 8)) == 0) {
            boo2 = true;
          }
        })
  
        return item.location.indexOf(this.data.activeFloor) == 0 && boo2;
      })
      this.setData({
        shopList: list,
        stallLength: 20
      })
      if (this.data.activeTab == 'plate') return;
      if (!this.scrollView) {
        this.getScrollCtx()
        return;
      };
      this.scrollView.scrollTo({ top: 0 });
    },

    parkingPopupOpen() {
      this.setData({
        parkingFold: false
      })
    },

    parkingPopupFold() {
      this.setData({
        parkingFold: !this.data.parkingFold
      })
      if (this.data.parkingFold) {
        this.searchCancel()
      }
    },
  
    maskTap() {
      this.setData({
        parkingFold: true
      })
      this.searchCancel()
    },

    selectShop(e) {
      let poi = e.currentTarget.dataset.poi;
      // this.targetPoi = poi
      // this.startNav()
      this.triggerEvent('selectShop', { poi })
    },

    selectPlate() {
      let poi = {
        name: this.data.parkingSpaceNumber
      }
      this.triggerEvent('selectShop', { poi })
    },

    searchCancel() {
      this.setData({
        showSearch: false,
        searchVal: '',
        searchRes: []
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
          boo = true
        }
        return boo
      })
      let buildingList = JSON.parse(JSON.stringify(this.data.buildingList))
      buildingList.forEach((item) => {
        item.floorList = JSON.parse(JSON.stringify(this.allFloorList));
        item.floorList.forEach((item2) => {
          item2.sortList = []
          Object.keys(ServerConfig.types[1]).forEach((item3, index) => {
            item2.sortList[index] = {
              key: item3,
              value: ServerConfig.types[1][item3].name,
              shopList: []
            }
            searchList.forEach((item4) => {
              let boo = false;
              let boo2 = false;
              if (item4.location == item2.key) {
                boo = true;
              }
              item4.type.forEach((item5) => {
                if (item5.substring(0, 8) == item3.substring(0, 8)) {
                  boo2 = true;
                }
              })
              if (boo && boo2) {
                item2.sortList[index].shopList.push(item4)
              }
            })
          })
        })
      })
      // console.log('arr1------------', buildingList)
      this.setData({
        searchRes: buildingList
      })
    },

    selectFloor(e) {
      let key = e.target.dataset.key;
      this.setData({
        activeFloor: key,
        activeTag: '',
      })
      this.getTags()
  
      this.findShop()
    },

    selectTag(e) {
      let key = e.target.dataset.key;
      if (this.data.activeTag == key) return;
      this.setData({
        activeTag: key
      })
  
      this.findShop()
    },
  
    searchInput(e) {
      this.setData({
        searchVal: e.detail.value
      })
      this.debounceSearch()
    },
  
    searchFocus() {
      this.setData({
        parkingFold: false
      })
    },

    searchTap() {
      // if (!this.data.parkingFold) {
      //   this.setData({
      //     showSearch: true,
      //     inputFocus: true
      //   })
      //   return
      // }
      this.setData({
        showSearch: true,
        parkingFold: false
      })
    },

    // ======================================================================
    slectTab(e) {
      this.setData({
        parkingFold: false
      })
      const key = e.currentTarget.dataset.key;
      if (this.data.activeTab == key) return;
      this.setData({
        activeTab: key
      })
    },

    scrollToLower() {
      this.setData({
        stallLength: this.data.stallLength + 20
      })
    },

    addNumPlace() {
      this.setData({
        numLengthLimit: 7,
        plateReady: false
      })
      this.parkingPopupOpen();
    },

    openProvince() {
      this.setData({
        provinceKeyboard: true,
        numKeyboard: false,
        plateReady: false
      })
      this.parkingPopupOpen();
    },

    openNum() {
      this.parkingPopupOpen();
      if (!this.data.carProvince) return;
      this.setData({
        numKeyboard: true,
        provinceKeyboard: false,
        plateReady: false
      })
    },

    delProvince() {
      this.setData({
        carProvince: ''
      })
    },

    delNum() {
      if (!this.data.carNumArr.length) return;
      this.data.carNumArr.splice(this.data.carNumArr.length - 1, 1);
      this.setData({
        carNumArr: this.data.carNumArr
      })
    },

    selectProvince(e) {
      const val = e.currentTarget.dataset.val;
      this.setData({
        carProvince: val,
      })
      this.openNum()
    },
    selectNum(e) {
	      const val = e.currentTarget.dataset.val;
	      if (this.data.carNumArr.length >= this.data.numLengthLimit) return;
	      this.data.carNumArr.push(val)
	      this.setData({
	        carNumArr: this.data.carNumArr
	      })
	      if (this.data.carNumArr.length >= 6) {
	        parkingInfo(this.data.carNumArr.join('')).then((res)=>{
							console.log('寻车数据：',res);
	          this.setData({
	            plateReady: true
	          })
	          if(res.count != 1) return;
						console.log('拼装数据');
						/// 转大写
						var mapName = res.list[0].mapName.toUpperCase()
						var spaceNumber = res.list[0].parkingSpaceNumber2.slice(1)
						if (spaceNumber.length == 1) {
							spaceNumber = "00" + spaceNumber
						}else if (spaceNumber.length == 2) {
							spaceNumber = "0" + spaceNumber
						}
						var parkingSpaceNumber = res.list[0].parkingSpaceNumber2.slice(0,1) + "-" + spaceNumber
	          this.setData({
	            plateRes: res.list[0],
							mapName:mapName,
							parkingSpaceNumber:parkingSpaceNumber

	          })
	        })
	      }
    },
	
   

  }
})
