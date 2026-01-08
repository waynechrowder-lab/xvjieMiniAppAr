import { getJiaoDian, getSystemInfo } from '../utils/util';

export function getMapDisplay(mapContext) {
    let lnglat;
    let region;
    let scale;

    return new Promise(resolve => {
        Promise.all([
            new Promise(resolve => {
                mapContext.getCenterLocation({
                    success: res => {
                        lnglat = res;
                        resolve();
                    }
                });
            }),
            new Promise(resolve => {
                mapContext.getScale({
                    success: ({ scale: currentScale }) => {
                        scale = currentScale;
                        resolve();
                    }
                });
            }),
            new Promise(resolve => {
                mapContext.getRegion({
                    success: res => {
                        region = res;
                        resolve();
                    }
                });
            }),
        ]).then(() => resolve({ lnglat: lnglat, region: region, scale: scale }));
    });
}

/**
 * 转换弧度
 * @param d
 * @returns {number}
 */
function getRad(d) {
    const PI = Math.PI;
    return d * PI / 180.0;
}

/**
 * 根据经纬度计算两点间距离
 * @param lng1
 * @param lat1
 * @param lng2
 * @param lat2
 * @returns {number} 距离 单位米
 */
export function lnglatDistance(lng1, lat1, lng2, lat2) {
    if (lng1 == lng2 && lat1 == lat2) return 0
    const f = getRad((lat1 + lat2) / 2);
    const g = getRad((lat1 - lat2) / 2);
    const l = getRad((lng1 - lng2) / 2);
    let sg = Math.sin(g);
    let sl = Math.sin(l);
    let sf = Math.sin(f);
    let s, c, w, r, d, h1, h2;
    const a = 6378137.0;//The Radius of eath in meter.
    const fl = 1 / 298.257;
    sg = sg * sg;
    sl = sl * sl;
    sf = sf * sf;
    s = sg * (1 - sl) + (1 - sf) * sl;
    c = (1 - sg) * (1 - sl) + sf * sl;
    w = Math.atan(Math.sqrt(s / c));
    r = Math.sqrt(s * c) / w;
    d = 2 * w * a;
    h1 = (3 * r - 1) / 2 / c;
    h2 = (3 * r + 1) / 2 / s;
    s = d * (1 + fl * (h1 * sf * (1 - sg) - h2 * (1 - sf) * sg));
    return s;
}

export const EATH_RADIUS = 6378137.0; // The Radius of eath in meter.
export const LAT_SCALE = EATH_RADIUS * Math.PI * 2 / 360;

export function lngDistance(lng1, lat1, lng2, lat2) {
    return (lng2 - lng1) * LAT_SCALE * Math.cos((lat1 + lat2) / 2 / 180 * Math.PI);
}

export function latDistance(lng1, lat1, lng2, lat2) {
    return (lat2 - lat1) * LAT_SCALE;
}


export function lnglatDistance2(lng1, lat1, lng2, lat2) {
    let dlng = lngDistance(lng1, lat1, lng2, lat2);
    let dlat = latDistance(lng1, lat1, lng2, lat2);
    return Math.hypot(dlng, dlat);
}

export function lngAddMeter(lng, lat, meter) {
    return lng + meter / (LAT_SCALE * Math.cos(lat / 180 * Math.PI));
}
export function latAddMeter(lng, lat, meter) {
    return lat + meter / LAT_SCALE;
}

/**
 * 一次性计算度距离、维度距离、坐标距离（平面坐标距离，短距离可用）
 * @param  {[type]} lng1 坐标1经度
 * @param  {[type]} lat1 坐标1纬度
 * @param  {[type]} lng2 坐标2经度
 * @param  {[type]} lat2 坐标2纬度
 * @return {Object}      {lngd,latd,distance}
 */
export function planeDistance3(lng1, lat1, lng2, lat2) {
    const lngd = lngDistance(lng1, lat1, lng2, lat2);
    const latd = latDistance(lng1, lat1, lng2, lat2);
    const distance = Math.hypot(lngd, latd);
    return {
        lngd,
        latd,
        distance,
    }
}

let latestLocation = undefined;

export function getLatestLocation() {
    return latestLocation;
}

export function setLatestLocation(lng, lat) {
    latestLocation = {
        latitude: lat,
        longitude: lng,
    };
}
export function getLocation(isHighAccuracy = true, isLocationChange = false) {
    let mock = wx.getStorageSync('mock');
    if (mock && mock.getLocation) {
        return new Promise((resolve) => {
            wx.request({
                url: `${mock.host}/get?platform=${getSystemInfo().platform}-${getSystemInfo().model}`,
                method: "GET",
                success: function (res) {
                    resolve(latestLocation = {
                        latitude: res.data.lat,
                        longitude: res.data.lng,
                    });
                },
                fail() {
                    wx.showToast({
                        title: '模拟位置获取出错了',
                        icon: 'none'
                    })
                    resolve(latestLocation = {
                        latitude: 31.207764,
                        longitude: 121.597731,
                    });
                },
            });
        });
    }
    //TODO IPCT-372 处理用户未授权定位的情况
    return new Promise((resolve, reject) => {
        if (wx.getSystemInfoSync().platform !== 'devtools') {
            wx.onLocationChange((result) => {
                resolve(latestLocation = {
                    latitude: result.latitude,
                    longitude: result.longitude,
                });
            })
        } else {
            wx.getLocation({
                type: 'gcj02',
                isHighAccuracy,
                success: function (res) {
                    resolve(latestLocation = {
                        latitude: res.latitude,
                        longitude: res.longitude,
                    });
                },
                fail(err) {
                    console.log('err', err);
                    reject(err);
                }
            })
        }
    });
}

export const NOT_ON_POINT_DISTANCE_MIN = 16; // 判断是否在最近的点上面
export const ON_LINE_DISTANCE_MAX = 10; // 判断点可以认为在某条线上的最大距离
export const PRE_SEARCH_COUNT = 25; // 默认每次搜索，往前搜索的点数
export const NEAR_POINT_MAX = 5; // 当点不精确在线段上时，用于判断改点在两端端点上的最大阈值
export const ARRIVE_DISTANCE_MAX = 1; // 距离终点小于这个距离认为已到达。
export class QQMap {
    static _keys = [
        'TOVBZ-X2CCP-62TDC-VMP2E-H73F3-FZFPB',
        'MBCBZ-WVU6W-4W4R5-RKQBU-I6D36-AHBFD',
        'I7IBZ-5ACCD-YYL4D-PWKDZ-QLFMS-I4FHX',
    ];

    constructor() {
        this.key = QQMap._keys[Math.floor(Math.random() * QQMap._keys.length)]; //选取其中一个key来用
    }

    /**
     * @type {QQMap}
     * @private
     */
    static _instance = undefined;

    /**
     * @return {QQMap}
     */
    static getMap() {
        if (!this._instance) this._instance = new QQMap();
        return this._instance;
    }
    requestRoute(from, to, trytimes) {
        let that = this;
        return new Promise((resolve, reject) => {
            // 模拟失败
            // setTimeout(() => {
            //     console.log('retry', trytimes)
            //     if (trytimes > 1) return this.requestRoute(from, to, trytimes - 1).then(resolve).catch(reject);
            //     console.log('reject', trytimes)
            //     reject('尝试失败');
            // }, 3000);
            wx.request({
                url: `https://apis.map.qq.com/ws/direction/v1/walking/?from=${from.latitude},${from.longitude}&to=${to.latitude},${to.longitude}&key=${this.key}`,
                success: function (res) {
                    // console.log('步行路线---', res);
                    if (res.data.status !== 0) {
                        reject(res.data.message); // todo 路径太短，也会返回起终点坐标错误、需要认为构造直线路径
                        return;
                    }
                    let route = res.data.result.routes[0];
                    let polyline = route.polyline;
                    for (let i = 2; i < polyline.length; i++) { //翻译回经纬度
                        polyline[i] = polyline[i - 2] + polyline[i] / 1000000;
                    }
                    that._last_route_walkRoute = route;// 缓存每次结果
                    that._last_from_walkRoute = from;
                    that._last_to_walkRoute = to;
                    that.lastPolylineItemIndex = 0;
                    resolve(route);
                },
                fail: function (err) {
                    console.log(err);
                    console.log('retry', trytimes)
                    if (trytimes > 1) return that.requestRoute(from, to, trytimes - 1).then(resolve).catch(reject);
                    reject('尝试失败');
                },
            });
        })
    }
    /**
     * 获取一到一的步行路线
     * @param from {{longitude:number, latitude:number}} 起始点
     * @param to {{longitude:number, latitude:number}} 目标点
     * @return 路线信息
     */
    walkRoute(from, to, target) {
        const that = this;
        this.target = target
        return new Promise(function (resolve, reject) {
            if (that._last_to_walkRoute) {
                const { latitude, longitude } = that._last_to_walkRoute;
                if (latitude == to.latitude, longitude == to.longitude) {// 终点没变
                    if (that._last_from_walkRoute) {
                        const { latitude, longitude } = that._last_from_walkRoute;
                        if (latitude == from.latitude && longitude == from.longitude) {// 起点没变
                            return resolve(that._last_route_walkRoute);
                        } else {
                            let mewResult = that.walkDirectionLocal(from);
                            if (mewResult) return resolve(mewResult);
                        }
                    }
                }
            }
            // console.log('walkRoute', from, to)
            return that.requestRoute(from, to, 2).then(resolve).catch(reject);
        }).then(route => this.filterResult(route));
    }
    /**
     * 终点不变等前提下可以调用本方法进行本地计算结果
     * @param {*} from 当前定位
     */
    walkDirectionLocal(from) {
        // console.log('walkDirectionLocal', JSON.stringify(this._last_route_walkRoute))
        // console.log('walkRoute',this._last_route_walkRoute);
        if (!this._last_to_walkRoute || !this._last_route_walkRoute) return false;
        const route = this._last_route_walkRoute;
        const _walkRouteTo = this._last_to_walkRoute;
        if (!this.lastPolylineItemIndex) this.lastPolylineItemIndex = 0;


        // 1.每段距离获取
        const { polyline, steps } = route;
        const polylineItems = []; // polyline上各段信息（距离、点1、点2）

        for (let i = 0; i < polyline.length - 2; i += 2) {
            const lat = polyline[i];
            const lng = polyline[i + 1];
            const lat2 = polyline[i + 2];
            const lng2 = polyline[i + 3];
            // const lngd = lngDistance(lng, lat, longitude, latitude);
            // const latd = latDistance(lng, lat, longitude, latitude);
            // const d2 = Math.pow(lngd, 2) + Math.pow(latd, 2);
            const d2 = planeDistance3(lng, lat, lng2, lat2).distance;

            polylineItems.push({
                isSinglePoint: lat == lat2 && lng == lng2,
                polyline_idx: [i, i + 3],
                latitude: lat,
                longitude: lng,
                latitude2: lat2,
                longitude2: lng2,
                d2,
                distance: 0,
                stepIndex: -1, // 所在step的index
            });
        }
        // 最后一项是:最后一个polyline到poi的连线
        const last_polyline_poi_d2_distance = planeDistance3(_walkRouteTo.longitude, _walkRouteTo.latitude, polyline[polyline.length - 1], polyline[polyline.length - 2]).distance;
        polylineItems.push({
            isSinglePoint: polyline[polyline.length - 2] == _walkRouteTo.latitude && polyline[polyline.length - 1] == _walkRouteTo.longitude,
            polyline_idx: [polyline.length - 2, polyline.length - 1],
            latitude: polyline[polyline.length - 2],
            longitude: polyline[polyline.length - 1],
            latitude2: _walkRouteTo.latitude,
            longitude2: _walkRouteTo.longitude,
            d2: last_polyline_poi_d2_distance,
            distance: last_polyline_poi_d2_distance,
            stepIndex: steps.length - 1,
        });

        // 把 polylineItems 组装到 step 上，并以此计算得到任意 polylineItems[i] 的实际 distance
        // ！！这里没有包含【最后一项】--最后一个polyline到poi的连线
        steps.forEach((step, stepIndex) => {
            step.d2Total = 0;
            step.polylineItems = [];
            for (let i = step.polyline_idx[0]; i < step.polyline_idx[1]; i += 2) {
                let polylineItem = polylineItems[i / 2];
                polylineItem.stepIndex = stepIndex;
                step.polylineItems.push(polylineItem);
                step.d2Total += polylineItem.d2;
            }
            step.polylineItems.forEach((polylineItem, i) => {
                polylineItem.indexForStepPolylineItems = i;
                polylineItem.distance = step.distance * polylineItem.d2 / step.d2Total; // 用比例求线上的相邻点距
            });
        });

        this._last_from_walkRoute = from;
        let searchResult = this.searchOnLine(route, polylineItems, from);
        if (!searchResult) return false;
        let { matchedIndex, findedPointOnLine } = searchResult;
        this._last_route_walkRoute = this.genRoute(route, polylineItems, matchedIndex, findedPointOnLine);
        return this._last_route_walkRoute;
    }
    // 2.取路径上最近的点用改点进行实际计算
    searchOnLine(route, polylineItems, from) {
        let searchStartIndex = Math.max(this.lastPolylineItemIndex - PRE_SEARCH_COUNT, 0);
        let searchEndIndex = Math.min(polylineItems.length - 1, this.lastPolylineItemIndex + PRE_SEARCH_COUNT);
        // polylineItems 取最近5段遍历，最少保留两段
        let minIndex = undefined;
        for (let index = searchStartIndex; index < searchEndIndex; index++) {
            if (polylineItems[index].isSinglePoint) continue;
            if (undefined === minIndex) minIndex = index;
            // 当前定位垂直到线上的点
            let jiaodian = getJiaoDian(
                { longitude: polylineItems[index].longitude, latitude: polylineItems[index].latitude },
                { longitude: polylineItems[index].longitude2, latitude: polylineItems[index].latitude2 },
                { longitude: from.longitude, latitude: from.latitude },
            )
            // 当前定位到线段的距离
            let distance = planeDistance3(jiaodian.longitude, jiaodian.latitude, from.longitude, from.latitude).distance;
            polylineItems[index].jiaodian = jiaodian;
            polylineItems[index].linePointDistance = distance;
        }
        // console.log('每段距离', polylineItems.slice(searchStartIndex, searchEndIndex).map(item => '[' + item.indexForStepPolylineItems + ']' + item.linePointDistance))
        for (let index = searchStartIndex; index < searchEndIndex; index++) {
            if (polylineItems[index].isSinglePoint) continue;
            if (polylineItems[minIndex].linePointDistance >= polylineItems[index].linePointDistance) minIndex = index;
        }

        if (this.lastPolylineItemIndex != minIndex) {
            // console.log('切换到新线段上', minIndex);
        }

        let polylineItem = polylineItems[minIndex];

        let findedPointOnLine = null;
        if (
            (polylineItem.longitude - polylineItem.jiaodian.longitude) * (polylineItem.longitude2 - polylineItem.jiaodian.longitude) <= 0 &&
            (polylineItem.latitude - polylineItem.jiaodian.latitude) * (polylineItem.latitude2 - polylineItem.jiaodian.latitude) <= 0
        ) {
            // console.log('在两点之间');
            findedPointOnLine = {
                between: true,
                p: polylineItem.jiaodian,
                p1distance: planeDistance3(polylineItem.jiaodian.longitude, polylineItem.jiaodian.latitude, polylineItem.longitude2, polylineItem.latitude2).distance / polylineItem.d2 * polylineItem.distance
            }
        } else {
            // console.log('在两点之外');
            // todo:增加两米距离范围冗余
            let ppDistance1 = planeDistance3(polylineItem.longitude, polylineItem.latitude, from.longitude, from.latitude).distance
            let ppDistance2 = planeDistance3(polylineItem.longitude2, polylineItem.latitude2, from.longitude, from.latitude).distance
            // console.log('两端点距离:', ppDistance1, ppDistance2);
            if (ppDistance1 < NEAR_POINT_MAX) {
                // 匹配起点附近
                findedPointOnLine = {
                    start: true,
                    p: { longitude: polylineItem.longitude, latitude: polylineItem.latitude },
                    p1distance: polylineItem.distance,
                }
                // console.log('在起点1:', minIndex);
            } else if (ppDistance2 < NEAR_POINT_MAX) {
                // 匹配结束点附近，取下一个点
                do {
                    minIndex = minIndex + 1;
                    polylineItem = polylineItems[minIndex];
                } while (polylineItem.isSinglePoint);

                findedPointOnLine = {
                    start: true,
                    p: { longitude: polylineItem.longitude, latitude: polylineItem.latitude },
                    p1distance: polylineItem.distance,
                }
                // console.log('在起点2:', minIndex);
            } else {
                console.log('未找到，重新规划');
            }
        }

        if (findedPointOnLine) {
            // console.log('findedPointOnLine', findedPointOnLine);
            return { matchedIndex: minIndex, findedPointOnLine };
        }
        return false;
    }
    /**
     * 根据点在线上的定位结果进一步得出最终结果
     * @param {*} route 原始导航结果数据
     * @param {*} polylineItems 每段距离信息数组
     * @param {*} polylineItemIndex 选中的距离信息下标
     * @param {*} findedPointOnLine 存储查找结果信息的对象，包括：当前点坐标、当前点到线段结束距离、是否在线段起点
     */
    genRoute(route, polylineItems, matchedIndex, findedPointOnLine) {
        const matchedPolylineItem = polylineItems[matchedIndex];
        const stepIndex = matchedPolylineItem.stepIndex;
        let leftSteps = route.steps.slice(stepIndex + 1);
        let leftStepDistances = [{ distance: 0 }, { distance: 0 }].concat(leftSteps).reduce((total, item) => total + item.distance, 0);
        leftStepDistances = leftStepDistances || 0;
        let currentStep = route.steps[stepIndex];
        let start_polyline_idx = matchedPolylineItem.polyline_idx[0];
        let current_step_end_polyline_idx = currentStep.polyline_idx[1];
        let leftPolylineDistanceInCurrentStep = 0;
        for (let index = matchedPolylineItem.indexForStepPolylineItems + 1; index < currentStep.polylineItems.length; index++) {
            leftPolylineDistanceInCurrentStep += currentStep.polylineItems[index].distance;
        }
        let currentItemDistance = findedPointOnLine.p1distance;
        let currentStepDistance = leftPolylineDistanceInCurrentStep + currentItemDistance;
        currentStepDistance = currentStepDistance.toFixed(0);// 精确到米

        let instruction = stepIndex == 0 && matchedPolylineItem.indexForStepPolylineItems !== 0 ? currentStep.instruction.substr(currentStep.instruction.indexOf(',') + 1) : currentStep.instruction;
        instruction = instruction.replace(currentStep.distance, currentStepDistance);// 替换文本距离
        // 3.polyline 操作
        currentStep = {
            ...currentStep,
            "polyline_idx": [start_polyline_idx, current_step_end_polyline_idx],// 后续统一修正idx=idx-start_polyline_idx
            "instruction": instruction,
            "distance": currentStepDistance,
        }
        // console.log('currentStep', currentStep);

        let distance = parseInt(leftStepDistances + parseInt(currentStepDistance));
        let duration = parseInt(route.duration * (distance / route.distance)); // 按剩余距离占总距离的比例求时间
        let direction = currentStep.dir_desc;
        let polyline = route.polyline.slice(start_polyline_idx);
        // 修正起点坐标
        polyline[0] = findedPointOnLine.p.latitude;
        polyline[1] = findedPointOnLine.p.longitude;
        let steps = [currentStep, ...leftSteps];
        if (start_polyline_idx > 0) {
            steps = steps.map(step => {
                step.polyline_idx = step.polyline_idx.map(idx => idx - start_polyline_idx);
                return step;
            });
        }

        let resultRoute = {
            "mode": "WALKING",
            "distance": distance,
            "duration": duration,
            "direction": direction,
            "polyline": polyline,
            "steps": steps,
        };

        // console.log('result route', resultRoute);

        return resultRoute;
    }

    filterResult(route) {
        return new Promise((resolve, reject) => {
            // 剩余距离 route.targetDisLast
            let distance = route.distance;
            // debugger;
            if (distance <= ARRIVE_DISTANCE_MAX && route.polyline.length < 6) { // 只有一段线段且不超过12米
                return reject('已在目的地附近');
            }
            let distanceText = '';
            if (distance < 1000) {
                distanceText = `${distance} 米`;
            } else {
                distanceText = `${Number((distance / 1000).toFixed(1))} 公里`;
            }
            route.distanceText = distanceText;

            // 剩余时间 targetDur
            let duration = route.duration;
            let durationText = '';
            if (duration < 60) {
                if (duration == 0) {
                    durationText = `${distance} 秒`;
                    if (parseInt(distance / 60) != 0) {
                        durationText = `${parseInt(distance / 60)} 分钟`;
                    } else {
                        durationText = `${parseInt(distance)} 秒`;
                    }
                } else {
                    durationText = `${duration} 分钟`;
                }

            } else {
                if (duration % 60 !== 0) {
                    durationText = `${parseInt(duration / 60)} 小时 ${duration % 60} 分钟`;
                } else {
                    durationText = `${parseInt(duration / 60)} 小时`;
                }
            }
            route.durationText = durationText;

            // 当前路段行进距离
            let distance0 = route.steps[0].distance;
            let distance0Text = '';
            if (distance0 < 1000) {
                distance0Text = `${distance0}米`;
            } else {
                distance0Text = `${Number((distance0 / 1000).toFixed(1))}公里`;
            }
            route.distance0Text = distance0Text;

            // 当前路段描述
            let actionText;
            if (route.steps[0].act_desc && route.steps[0].act_desc.length > 0) {
                actionText = route.steps[0].act_desc;
            } else {
                actionText = '抵达';
            }
            route.actionText = actionText;
            resolve(route);
        })
    }

}