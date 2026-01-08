const base_url = 'https://wl-api-proxy.easyar.com/pk0f-ibe/';
const get_key_path = '/mpgs/rest/swagger/getSign';
const parking_path = '/mpgs/api/v3/parkingSpace/getParkingSpaceInfo';


const park_key = 'A10001';
const park_secret = 'uqvmk807oehIZ7wS';
const park_version = 'V3.0.0';

let park_sigin = '';


function timestamp() {
	
	Date.prototype.Format = function (format) {
			const o = {
				"M+": date.getMonth() + 1, // 月份
				"d+": date.getDate(), // 日
				"h+": date.getHours() % 12 === 0 ? 12 : date.getHours() % 12, // 小时
				"H+": date.getHours(), // 小时
				"m+": date.getMinutes(), // 分
				"s+": date.getSeconds(), // 秒
				"q+": Math.floor((date.getMonth() + 3) / 3), // 季度
				S: date.getMilliseconds(), // 毫秒
				a: date.getHours() < 12 ? "上午" : "下午", // 上午/下午
				A: date.getHours() < 12 ? "AM" : "PM", // AM/PM
			};
			if (/(y+)/.test(format)) {
				format = format.replace(
					RegExp.$1,
					(date.getFullYear() + "").substr(4 - RegExp.$1.length)
				);
			}
			for (let k in o) {
				if (new RegExp("(" + k + ")").test(format)) {
					format = format.replace(
						RegExp.$1,
						RegExp.$1.length === 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
					);
				}
			}
			return format;
	}
	let date = new Date();
	return date.Format('yyyyMMddHHmmss');
}
function getkey() {
	let params = {
		"key": park_key,
		"timestamp": String(timestamp()),
		"version": park_version,
		"secret": park_secret
	}
	return new Promise((reslove,reject)=>{
			wx.request({
				url: base_url + get_key_path,
				method:"GET",
				data:params,
				success(res) {
					console.log("3.1.1.	获取对外接口API签名值:",res);
					reslove(res.data);
					park_sigin = res.data.data;
					console.log("sign:",res.data.data);
				},
				fail(err){
					console.log(err);
					reject(err);
				}
			})
	})
}

function parkingInfo(carLicenseNumber) {
	let params = {
		"key": park_key,
		"timestamp": String(timestamp()),
		"version": park_version,
		"sign": park_sigin,
		"carLicenseNumber": carLicenseNumber
	}
	console.log("寻车请求参数：",params);
	return new Promise((reslove,reject)=>{
		wx.request({
			url: base_url + parking_path,
			method:"POST",
			data:params,
			success(res){
				console.log("查找寻车数据：",res.data.data);
				reslove(res.data.data)
			},
			fail(err) {
				reject(err)
			}
		})
	})

}



module.exports = {
	timestamp,getkey,parkingInfo
}