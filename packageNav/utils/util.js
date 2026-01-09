import { Vec3, Quat, Mat4 } from '../third/math';

const systemInfo = wx.getSystemInfoSync();
const accountInfo = wx.getAccountInfoSync();

function getSystemInfo() {
	return systemInfo;
}

export const getWindowHeightRpx = () => {
	return getSystemInfo().windowHeight / getSystemInfo().windowWidth * 750
}

export const IS_ANDROID = systemInfo.platform === 'android';

export const IS_DEVTOOLS = systemInfo.platform === 'devtools';

export const IS_IOS = systemInfo.platform === 'ios';

function getAccountInfo() {
	return accountInfo;
}

export const SUPPORTED = {
	CAMERA: {
		INITDONE: !IS_IOS || isVersionAtleast('7.1.0')
	},
	PAGE: {
		SETDATA: !IS_IOS || isVersionAtleast('7.1.0')
	}
}

const formatTime = date => {
	const year = date.getFullYear()
	const month = date.getMonth() + 1
	const day = date.getDate()
	const hour = date.getHours()
	const minute = date.getMinutes()
	const second = date.getSeconds()

	return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatDate(date) {
	let d = date,
		month = '' + (d.getMonth() + 1),
		day = '' + d.getDate(),
		year = d.getFullYear();

	if (month.length < 2)
		month = '0' + month;
	if (day.length < 2)
		day = '0' + day;

	return [year, month, day].join('-');
}

function getDayNum(startTime = new Date(), endTime) {
	const stTime = Date.parse(startTime)
	const etTime = Date.parse(new Date(endTime))
	const usedTime = etTime - stTime;
	const days = Math.floor(usedTime / (24 * 3600 * 1000));
	return days
}

const formatNumber = n => {
	n = n.toString()
	return n[1] ? n : '0' + n
}

function a2s(ab) {
	let res = [];
	for (let i = 0; i < ab.length; i++) {
		res.push(String.fromCharCode(ab[i]));
	}
	return res.join('');
	// return String.fromCharCode.apply(null, ab)
}

function imageToFormData(image, header) {
	var formData = '--' + header;
	formData += '\r\nContent-Disposition: form-data; name="image"; filename="default.jpeg"';
	formData += '\r\nContent-Type: image/jpeg';
	formData += '\r\n';
	formData += '\r\n' + image;
	formData += '\r\n--' + header + '--\r\n';
	return formData;
}

function isIpx() {
	const model = systemInfo.model;
	return /iphone\sx/i.test(model) || (/iphone/i.test(model) && /unknown/.test(model)) || /iphone\s11/.test(model);
}

function parseTime(time) {
	const minute = Math.floor(time / 60)
	const second = Math.floor(time % 60)
	return `${minute < 10 ? '0' + minute : minute}:${second < 10 ? '0' + second : second}`
}

function getRealLength(n) {
	return n * systemInfo.windowWidth / 750;
}

function px2Rpx(n) {
	return n * 750 / systemInfo.windowWidth;
}

function getImageInfo(url) {
	return new Promise((resolve, reject) => {
		wx.getImageInfo({
			src: url,
			success: (res) => {
				resolve(res.path);
			},
			fail: () => {
				reject();
			}
		});
	});
}

// 函数去抖
function debounce(fn, delay) {
	var timer = null;
	return function (...args) {
		clearTimeout(timer);
		timer = setTimeout(() => fn.apply(this, args), delay);
	}
}

const cachedFunctionNameMap = new Map();

function getFunctionName(fun) {
	let cachedFunctionName = null;
	if (cachedFunctionName = cachedFunctionNameMap.get(fun)) return cachedFunctionName;
	let ret = fun.toString().substr('function '.length);
	cachedFunctionName = ret.substr(0, ret.indexOf('('));
	if (!cachedFunctionName) { // 匿名
		cachedFunctionName = ret.replace(/\s/g, '').substr(0, 30);
	}
	return cachedFunctionName;
}

// 函数节流
function throttle(fn, wait) {
	var timer;
	return function (...args) {
		if (!timer) {
			timer = setTimeout(() => timer = null, wait);
			return fn.apply(this, args);
		}
	}
}

function mapByKey(arr, key) {
	let map = new Map();
	for (let item of arr) {
		map.set(item[key], item);
	}
	return map;
}

//获取格式化时间
function getTime() {
	Date.prototype.Format = function (fmt) {
		let o = {
			"M+": this.getMonth() + 1, //月份
			"d+": this.getDate(), //日
			"h+": this.getHours(), //小时
			"m+": this.getMinutes(), //分
			"s+": this.getSeconds(), //秒
			"q+": Math.floor((this.getMonth() + 3) / 3), //季度
			"S": this.getMilliseconds() //毫秒
		};
		if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
		for (let k in o)
			if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		return fmt;
	}

	let date = new Date();
	return date.Format('yyyy.MM.dd');
}

class Change {
	constructor() {
		this.map = new Map();
	}
	changed(kv, parseEach) {
		if (!parseEach) parseEach = val => val;
		let changed = false;
		if (typeof kv === 'string') {// 转 json
			kv = { [kv]: true, type: 'string' }
		}
		for (var key in kv) {
			const v = JSON.stringify(parseEach(kv[key]));
			if (this.map.get(key) !== v) {
				changed = true;
				this.map.set(key, v);
			}
		}
		return changed;
	}
	clear() {
		this.map.clear();
	}
}

function randomBetween(min, max, fixed = 2) {
	return (min + Math.random() * (max - min)).toFixed(fixed);
}

/**
 * 延迟执行
 * @param {*} fn do
 * @param {*} delay ms
 */
function delay(fn, delay) {
	if (delay > 0) {
		return setTimeout(fn, delay);
	}
	else return fn();
}

/**
 * 求交点坐标
 * @param {*} p1 线段起点
 * @param {*} p2 线段终点
 * @param {*} p3 线外点
 */
function getJiaoDian(p1, p2, p3) {
	var P = {};

	//如果p1.longitude==p2.longitude 说明是条竖着的线
	if (p1.longitude - p2.longitude == 0) {
		P.longitude = p1.longitude;
		P.latitude = p3.latitude;
	}
	else {
		var A = (p1.latitude - p2.latitude) / (p1.longitude - p2.longitude)
		var B = p1.latitude - A * p1.longitude
		var m = p3.longitude + A * p3.latitude

		P.longitude = (m - A * B) / (A * A + 1)
		P.latitude = A * P.longitude + B
	}

	return P
}

/**
 * 求点线距离
 * @param {*} p1 线段起点
 * @param {*} p2 线段终点
 * @param {*} p3 线外点
 */
function getJuLi(p1, p2, p3) {
	var len;

	//如果p1.longitude==p2.longitude 说明是条竖着的线
	if (p1.longitude - p2.longitude == 0) {
		len = Math.abs(p3.longitude - p1.longitude)
	}
	else {
		var A = (p1.latitude - p2.latitude) / (p1.longitude - p2.longitude)
		var B = p1.latitude - A * p1.longitude

		len = Math.abs((A * p3.longitude + B - p3.latitude) / Math.sqrt(A * A + 1))
	}

	return len
}

/**
 * 同步coupon字段和config中的一致:title,subtitle
 * @param {*} coupon coupon对象
 */
function couponFormat(coupon) {
	const { name, description, ...others } = coupon;
	return {
		title: name,
		subtitle: description,
		...others,
	}
}

/**
 * 同步coupon数组，统一字段和config中的一致:title,subtitle
 * @param {[]} coupons coupon对象数组
 */
function couponsFormat(coupons) {
	if (!coupons) return [];
	return coupons.map(couponFormat);
}

function wrapText(canvas, context, text, x, y, maxWidth, lineHeight, maxLine) {
	if (typeof text != 'string' || typeof x != 'number' || typeof y != 'number') {
		return;
	}

	maxWidth = maxWidth || 500;
	lineHeight = lineHeight || 40;
	maxLine = maxLine || 1;

	// 字符分隔为数组
	let arrText = text.split('');
	let line = '';
	let lineCount = 0;

	for (let n = 0; n < arrText.length; n++) {
		let testLine = line + arrText[n];
		let metrics = context.measureText(testLine);
		let testWidth = metrics.width;
		if (testWidth > maxWidth && n > 0) {
			lineCount++;
			if (lineCount >= maxLine) line = line.substring(0, line.length - 1) + "…";
			context.fillText(line, x, y);
			if (lineCount >= maxLine) break;
			line = arrText[n];
			y += lineHeight;
		} else {
			line = testLine;
		}
	}

	if (lineCount >= maxLine) return;
	context.fillText(line, x, y);
}

function compareVersion(v1, v2) {
	v1 = v1.split('.');
	v2 = v2.split('.');
	const len = Math.max(v1.length, v2.length);

	while (v1.length < len) {
		v1.push('0');
	}
	while (v2.length < len) {
		v2.push('0');
	}

	for (let i = 0; i < len; i++) {
		const num1 = parseInt(v1[i]);
		const num2 = parseInt(v2[i]);

		if (num1 > num2) {
			return 1;
		} else if (num1 < num2) {
			return -1;
		}
	}

	return 0;
}

export function isSdkVersionAtleast(expectedVersion) {
	return compareVersion(getSystemInfo().SDKVersion, expectedVersion) >= 0;
}

export function isVersionAtleast(expectedVersion) {
	return compareVersion(getSystemInfo().version, expectedVersion) >= 0;
}

function qiniuUrl(path) {
	return 'https://sightp-tour-cdn.sightp.com/' + path;
}

function groupBy(array, f) {
	let groups = {};
	if (typeof f == 'string') {
		let prop = f;
		f = o => o[prop];
	}
	if (typeof f !== 'function') return array;
	array.forEach(function (o) {
		let group = f(o);
		groups[group] = groups[group] || [];
		groups[group].push(o);
	});
	return groups;
	// return Object.keys(groups).map(function(group) {
	// 	return groups[group];
	// });
}

function keyBy(array, f) {
	let res = {};
	if (typeof f == 'string') {
		let prop = f;
		f = o => o[prop];
	}
	if (typeof f !== 'function') return array;
	array.forEach(function (o) {
		let key = f(o);
		res[key] = o;
	});
	return res;
}

function mapObject(obj, fn) {
	let res = {};
	for (let key in obj) {
		res[key] = fn(obj[key]);
	}
	return res;
}

function parseParam(param, key) {
	var paramStr = "";
	if (['string', 'number', 'boolean'].indexOf(typeof param) > -1) {
		paramStr += `&${key}=${param}`;
	} else if (param instanceof Array) {
		param.forEach((p, i) => {
			var k = key == null ? i : `${key}[${i}]`;
			paramStr += '&' + parseParam(p, k);
		});
	} else if (undefined === param) {
		return '';
	} else { // object
		Object.keys(param).forEach((i) => {
			var k = !key ? i : `${key}.${i}`;
			paramStr += '&' + parseParam(param[i], k);
		})
	}
	return paramStr.substr(1);
}

function rpx2px(rpxNum) {
	return rpxNum / 750 * systemInfo.windowWidth;
}

const throttleNavigateTo = throttle((...args)=>{
	wx.navigateTo(...args)
},3000)

function getPosForward (pose) { // 获取相机位置、朝向
  let mat = new Mat4();
  mat.set(pose);
  let cameraMat = mat.clone().getInverse();
  // console.log('pose', mat);
  // console.log('cameraMat', cameraMat);

  let cameraPos = new Vec3(cameraMat.data[3], cameraMat.data[7], cameraMat.data[11]);
  // console.log('cameraPos', cameraPos);

  let nor = new Vec3(cameraMat.data[2], cameraMat.data[6], cameraMat.data[10]);
  let cameraForward = nor.normalize().scale(-1);
  // console.log('forward', cameraForward);

  return {
    cameraPos: cameraPos,
    cameraForward: cameraForward
  }
}

function getDistance (contents, cameraPos) { // 获取cube与相机的距离
  contents.forEach(item => {
    let p = new Vec3(item.position.x, item.position.y, item.position.z);
    item.distance = cameraPos.distance(p);
  });

  contents.sort((a, b) => {
    return a.distance - b.distance;
  })

  return contents;
}

function canvasDrawBuffer(canvas2d, buffers, w, h) {
	const ctx = canvas2d.getContext('2d');
	let imageData = canvas2d.createImageData(new Uint8ClampedArray(buffers.slice(0)), w, h)
	ctx.clearRect(0, 0, w, h);
	ctx.putImageData(imageData, 0, 0);
}

module.exports = {
	rpx2px, qiniuUrl, groupBy, keyBy, mapObject, parseParam, IS_DEVTOOLS, IS_ANDROID, IS_IOS, SUPPORTED,
	couponFormat, couponsFormat, getSystemInfo, getAccountInfo, isSdkVersionAtleast, isVersionAtleast, getWindowHeightRpx,
	wrapText, formatDate, getDayNum, getJiaoDian, getJuLi, delay, randomBetween, formatTime, imageToFormData, isIpx, parseTime, getRealLength, px2Rpx, debounce, throttle, mapByKey, Change, getImageInfo, getTime,
	throttleNavigateTo, getPosForward, getDistance,canvasDrawBuffer
}
