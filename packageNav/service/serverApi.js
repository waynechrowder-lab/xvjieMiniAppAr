import {ServerConfig} from "./config";
import {parseParam} from '../utils/util';
import EnvConfig from '../config/config';
const { btoa, sha256 } = requirePlugin("SPARPlugin");

function request(url, method, header, data) {
    if (method && method.toUpperCase() == 'DELETE') {
        return new Promise((resolve, reject) => {
            console.log(data)
            let p = parseParam(data);
            wx.request({
                url: p ? `${url}?${p}` : url,
                method,
                header,
                data: {},
                success: (res) => {
                    resolve(res.data);
                },
                fail: (err) => {
                    reject(err);
                }
            });
        });
    }
    return new Promise((resolve, reject) => {
        wx.request({
            url,
            method,
            header,
            data,
            success: (res) => {
                resolve(res.data);
            },
            fail: (err) => {
                reject(err);
            }
        });
    });
}

function requestRes(url, method, header, data) {
    return new Promise((resolve, reject) => {
        wx.request({
            url,
            method,
            header,
            data,
            success: (res) => {
                resolve(res);
            },
            fail: (err) => {
                reject(err);
            }
        });
    });
}

function upload(url, filePath, name, header, formData) {
    return new Promise((resolve) => {
        wx.uploadFile({
            url,
            filePath,
            name,
            header,
            formData,
            success: (res) => {
                resolve(res.data);
            }
        });
    });
}

const calcToken = function() {
    let params = {
        'appKey': ServerConfig.appKey,  // 项目的appKey
        'expires': new Date().getTime() + 3600 * 1000 // 有效期(毫秒)
    };

    // 转换为JSON字符串
    let raw = JSON.stringify(params);

    // 项目的appSecret
    let appSecret = ServerConfig.appSecret;

    // sha256哈希
    let hash = sha256(raw + appSecret);

    // base64编码, 此token为最终的认证token, 在有效期内无需重新生成
    let token = btoa(hash + raw);	
    return token;
}

let tokenData = {token: '', timestamp: 0};
const getToken = () => {
    let time = new Date().getTime();
    if (time - tokenData.timestamp > 3.6e6) {
        tokenData = {
            token: calcToken(),
            timestamp: time
        }
    }
    return tokenData.token;
}

//获取项目基本信息
const getProjectData = function() {
    let header = {'Authorization': getToken()};
    return request(ServerConfig.serverUrl + '/api/project', 'GET', header, null);
}

// const getSystemSetting = function() {
//     let header = {'Authorization': getToken()};
//     return request(ServerConfig.serverUrl + '/api/project/setting', 'GET', header, null);
// }

// const getMallInfo = function() {
//     let header = {'Authorization': getToken()};
//     return request(ServerConfig.serverUrl + '/api/mall-v2/mall/v2/' + ServerConfig.mallId, 'GET', header, null);
// }

const getProjectSetting = function() {
  let header = {
    'Authorization': getToken(),
    'mall-uuid': ServerConfig.uuid
  };
  return request(ServerConfig.serverUrl + `/api/v2/project/setting`, 'GET', header, null);
}

const getSystemSetting = function() {
  let header = {
    'Authorization': getToken(),
    'mall-uuid': ServerConfig.uuid
  };
  return request(ServerConfig.serverUrl + `/api/mall-v3/malls/${ServerConfig.uuid}/config`, 'GET', header, null);
}

const getMallInfo = function(property) {
  let header = {
    'Authorization': getToken(),
    'mall-uuid': ServerConfig.uuid
  };
  let data = {
    property: property || ''
  };
  return request(ServerConfig.serverUrl + `/api/mall-v3/malls/${ServerConfig.uuid}/poi`, 'GET', header, data);
}

const getMultiMapSetting = function(routeId) {
    let header = {'Authorization': getToken()};
    return request(`https://dijkstra-server-staging-api.easyar.com/config/${routeId}`, 'GET', header, null);
}

//获取点位列表
const getSpots = function () {
    let header = { 'Authorization': getToken() };
    let data = {};
    // 有isDebug属性
    if (EnvConfig.isDebug === 0 || EnvConfig.isDebug === 1) {
        data.isDebug = EnvConfig.isDebug;
    }
    return request(ServerConfig.serverUrl + '/api/project/spots', 'GET', header, data);
}

//获取点位列表
const postSpots = function (spotUuids = []) {
    let header = { 'Authorization': getToken() };
    return request(ServerConfig.serverUrl + '/api/project/spots', 'POST', header, { spotUuids })
}

//获取点位详情
const getSpot = function(uuid) {
    let header = {'Authorization': getToken()};
    return request(ServerConfig.serverUrl + '/api/project/spots/' + uuid, 'GET', header, null);
}

//查询所有分类
const getSpotTypes = function() {
    let header = {'Authorization': getToken()};
    return request(ServerConfig.serverUrl + '/api/project/settings', 'GET', header, null);
}
//通过顶级分类(topId)查询
const getSpotTypesFromTopId = function(id) {
    let header = {'Authorization': getToken()};
    return request(ServerConfig.serverUrl + '/api/project/settings/top-id/' + id, 'GET', header, null);
}
//通过上级分类(parentId)查询
const getSpotTypesFromParentId = function(id) {
    let header = {'Authorization': getToken()};
    return request(ServerConfig.serverUrl + '/api/project/settings/parent-id/' + id, 'GET', header, null);
}


//获取用户openId
const getOpenId = function(code) {
    let header = {'Authorization': getToken()};
    return request(ServerConfig.serverUrl + '/api/wx/login?code=' + code, 'GET', header, null);
}

//保存小程序用户基本信息
const saveUserInfo = function(openId) {
    let header = {'Authorization': getToken()};
    let data = Object.assign({openId: openId}, /* WxApp.getApp().globalData.userInfo */);
    return request(ServerConfig.serverUrl + '/api/wx/user', 'POST', header, data);
}

//保存用户分享
const share = function(openId, spotId, url) {
    let header = {'Authorization': getToken(), 'content-type': 'application/x-www-form-urlencoded'};
    return request(ServerConfig.serverUrl + '/api/wx/share', 'POST', header, {openId, spotId, url});
}
//查询用户分享
const getShareInfo = function(uuid) {
    let header = {'Authorization': getToken()};
    return request(ServerConfig.serverUrl + '/api/wx/share/' + uuid, 'GET', header, null);
}


//获取上传文件token (token用于上传文件)
const getUploadToken = function(fileExt) {
    let header = {'Authorization': getToken()};
    return request(ServerConfig.serverUrl + '/api/upload/token?fileExt=' + fileExt, 'GET', header, null);
}

//上传文件，传入的domain/key/token都是从getUploadToken接口的返回值来的
const uploadFile = function(localFile, domain, key, token) {
    return new Promise((resolve, reject) => {
        wx.uploadFile({
            url: "https://upload.qiniup.com/",
            filePath: localFile,
            name: "file",
            formData: {
                key: key,
                token: token,
            },
            success: () => {
                resolve(domain + key);
            },
            fail: (e) => {
                console.error(e);
                reject(e);
            },
        });
    });
}


//查询附近的商场
const getNearby = function(x, y) {
    let header = {'Authorization': getToken()};
    return request(ServerConfig.serverUrl + '/api/mall/nearby', 'GET', header, {x, y});
}

//查询所有活动
const getActivities = function(category) {
    let header = {'Authorization': getToken()};
    return request(ServerConfig.serverUrl + '/api/mall/activities?category=' + category, 'GET', header, null);
}

//抽奖
const prizeDraw = function(openId, mallUuid, activityUuid) {
    let header = {'Authorization': getToken()};
    return request(ServerConfig.serverUrl + '/api/mall/prize-draw', 'POST', header, {openId, mallUuid, activityUuid});
}

//发放卡券的签名
const cardSign = function(cardId) {
    let header = {'Authorization': getToken()};
    return request(ServerConfig.serverUrl + '/api/wx/card-sign', 'GET', header, {cardId});
}

//解码并保存已发放的卡券
const cardCodeDecrypt = async function(openId, code) {
    let header = {'Authorization': getToken()};
    return request(ServerConfig.serverUrl + '/api/wx/card-code-decrypt', 'POST', header, {code, openId});
}

//查询卡券的库存
const cardInfo = function(cardId) {
    let header = {'Authorization': getToken()};
    return request(ServerConfig.serverUrl + '/api/wx/card-info', 'GET', header, {cardId});
}

//查询卡券code状态
const cardCodeInfo = function(code) {
    let header = {'Authorization': getToken()};
    return request(ServerConfig.serverUrl + '/api/wx/card-code-info', 'GET', header, {code});
}

//查询用户已领取卡券
const getUserCards = function(openId, card = '') {
    let header = {'Authorization': getToken()};
    return request(ServerConfig.serverUrl + '/api/wx/user/cards', 'GET', header, {openId, card});
};

// 获取订单信息
const getOrders = function(openId, status) {
    let header = {'Authorization': getToken()};
    return requestRes(ServerConfig.serverUrl + '/api/orders', 'GET', header, {openId, status});
}

// 创建订单
const postOrders = function (openId) {
    let header = { 'Authorization': getToken() };
    return request(ServerConfig.serverUrl + '/api/orders', 'POST', header, { openId });
}

// 获取v2订单信息 - 包绑定
const getPaymentOrders = function (openId, status) {
    let header = { 'Authorization': getToken() };
    return requestRes(ServerConfig.serverUrl + '/api/v2/orders', 'GET', header, { openId, status });
}

// v2创建订单 - 包绑定
const postPaymentOrders = function (openId, paymentId) {
    let header = { 'Authorization': getToken() };
    return request(ServerConfig.serverUrl + '/api/v2/orders', 'POST', header, { openId, paymentId });
}

// 收费点位列表
const getSpotFee = function () {
    let header = { 'Authorization': getToken() };
    return request(ServerConfig.serverUrl + '/api/v2/spot/fee', 'GET', header, {  });
}

// 查询版本配置
const getWxMinVersion = function (ver) {
    let header = { 'Authorization': getToken() };
    return request(ServerConfig.serverUrl + '/api/v2/wx-min-ver', 'GET', header, { ver });
}

// 获取已免费点位-v2.0后返回数组
const getExperienceFree = function (openId) {
    let header = { 'Authorization': getToken() };
    return request(ServerConfig.serverUrl + '/api/spot-experience-free', 'GET', header, { openId });
}

// 创建订单
const postExperienceFree = function(openId, spotId) {
    let header = {'Authorization': getToken()};
    return request(ServerConfig.serverUrl + '/api/spot-experience-free', 'POST', header, {openId, spotId});
}

const getQuestionPostScore = function(activityUuid, openId, score) {
    let header = {'Authorization': getToken()};
    return request(ServerConfig.serverUrl + '/api/question/score', 'POST', header, {activityUuid, openId, score});
}

const getQuestionSetting = function(activityUuid) {
    let header = {'Authorization': getToken()};
    return request(ServerConfig.serverUrl + '/api/question/setting', 'GET', header, {activityUuid});
}

// 1.3 获取排名
/**
 * @param params { {openId: string, activityUuid: string, page: number, size: number} }
 * @return {Promise}
 */
const getQuestionRank = function(params) { // {openId, activityUuid}
    let header = {'Authorization': getToken()};
    return request(ServerConfig.serverUrl + '/api/question/rank', 'GET', header, params);
}

// 获取碎片收集状态
const getTreasure = function(activityUuid, openId) {
    let header = {'Authorization': getToken()};
    return request(ServerConfig.serverUrl + '/api/hua-hai/cards', 'GET', header, {activityUuid, openId});
}

// 收集碎片
const postTreasure = function(activityUuid, openId, spotId) {
    let header = {'Authorization': getToken()};
    return request(ServerConfig.serverUrl + '/api/hua-hai/cards', 'POST', header, {activityUuid, openId, spotId});
}

// 获取系统推荐路线
const getSysRoute = function (params) {
    let header = {'Authorization': getToken()};
    return request(ServerConfig.serverUrl + '/api/v2/sys-routes', 'GET', header, params);
}

// 保存用户选中路线
const postUserRoutes = function (openId, routeId) {
    let header = { 'Authorization': getToken() };
    return request(ServerConfig.serverUrl + '/api/v2/user-routes', 'POST', header, { openId, routeId });
}
// 删除用户路线
const deleteUserRoutes = function (openId) {
    let header = { 'Authorization': getToken() };
    return request(ServerConfig.serverUrl + '/api/v2/user-routes', 'DELETE', header, { openId });
}

// 获取用户选中路线
const getUserRoutes = function (openId) {
    let header = { 'Authorization': getToken() };
    return request(ServerConfig.serverUrl + '/api/v2/user-routes', 'GET', header, { openId });
}

// 文创-获取产品列表
const getArProducts = function () {
    let header = { 'Authorization': getToken() };
    return request(ServerConfig.serverUrl + '/api/v2/ar-products', 'GET', header, {});
}

// 获取活动列表
const getV2Activities = function (openId) {
    let header = { 'Authorization': getToken() };
    return request(ServerConfig.serverUrl + '/api/v2/activities', 'GET', header, { openId });
}

// 用户点位
// 保存走过的点位
const postUserSpots = function (openId, spotId) {
    let header = { 'Authorization': getToken() };
    return request(ServerConfig.serverUrl + '/api/v2/user-spots', 'POST', header, { openId, spotId });
}
// 获取走过的点位列表
const getUserSpots = function (openId) {
    let header = { 'Authorization': getToken() };
    return request(ServerConfig.serverUrl + '/api/v2/user-spots', 'GET', header, { openId });
}
// 清除所有点位信息
const deleteUserSpots = function (openId) {
    let header = { 'Authorization': getToken() };
    return request(ServerConfig.serverUrl + '/api/v2/user-spots', 'DELETE', header, { openId });
}

function requestQiniu(url) {
    return new Promise((resolve, reject) => {
        wx.request({
            url: 'https://sightp-tour-cdn.sightp.com/' + url,
            method: 'GET',
            header: {},
            data: {},
            success: (res) => {
                resolve(res.data);
            },
            fail: (err) => {
                reject(err);
            }
        });
    });
}

// 猫酷 - 使用手机号登录/注册
const mallcooLogin = function ({ openId, iv, data }) {
    let header = { 'Authorization': getToken() };
    return request(ServerConfig.serverUrl + '/api/v2/mallcoo/login', 'POST', header, { openId, iv, data });
}


export const serverApi = {
    getSysRoute, postUserRoutes, deleteUserRoutes, getUserRoutes, requestQiniu, getArProducts, getV2Activities, postUserSpots, getUserSpots, deleteUserSpots,
    getProjectData, getToken, getSpots, postSpots, getSpot, getSpotTypes, getSpotTypesFromTopId, getSpotTypesFromParentId,
    getOpenId, saveUserInfo, share, getShareInfo, getUploadToken, uploadFile,upload,
    cardSign, cardCodeDecrypt, cardInfo, cardCodeInfo, getUserCards,
    getNearby, getActivities, prizeDraw, getSystemSetting,
    getOrders, postOrders, getExperienceFree, postExperienceFree, getSpotFee, getWxMinVersion, getPaymentOrders, postPaymentOrders,
    getTreasure, postTreasure,
    mallcooLogin,
    getQuestionPostScore, getQuestionSetting, getQuestionRank,
    getMallInfo, getMultiMapSetting, getProjectSetting
}