const DEFAULT_CONF = require('./conf');
const EnvConfig = require('../config/config');
const APPS = {
    mallnavigation: { // mallnavigation/mallnavigation
        "appId": "wxa9e993e42fd72bdc",
        // "appkey": "d3068f9e5b424bf68fd858f4d8f68e4e",
        // "appSecret": "d054352b07f94a6eb15c5fadf1178dde4a0e6a3939e24748aebb39a4d62f83de"
    }
}

/**
 * 
 * @param {*} key 全局配置中小程序配置的key
 * @param {*} backendBaseConf 全局配置
 * @param {*} backendCustomConf 当前小程序特定配置
 */
const buildServerConfig = (key, backendBaseConf, backendCustomConf) => {
    const conf = {
        ...backendBaseConf.baseInfo,
        ...APPS[key],
        ...backendBaseConf[key],
        ...backendCustomConf,
    };
    console.log('更新配置', conf);
    return conf;
}

// 更改APP_NAME=更改小程序
export const APP_NAME = 'mallnavigation';

// export const ServerConfig = buildServerConfig(APP_NAME, DEFAULT_CONF);


// export const ServerConfig = {...buildServerConfig(APP_NAME, DEFAULT_CONF), ...DEFAULT_CONF.dev};

Object.assign(DEFAULT_CONF.config, { ...EnvConfig, isProd: EnvConfig.env == 'prod', isStaging: EnvConfig.env == 'staging', isDev: EnvConfig.env == 'dev' });

export const Config = DEFAULT_CONF.config;

// 测试环境 key、sercret、请求地址
export const ServerConfig = {
    ...buildServerConfig(APP_NAME, DEFAULT_CONF),
    ...(Config.isDev ? DEFAULT_CONF.dev : {}),
    ...(Config.isStaging ? DEFAULT_CONF.staging : {})
};

const configListeners = [];

export const onConfigChanged = (fn, immediate = true) => {
    immediate && fn && fn(ServerConfig, Config)
    configListeners.push(fn);
}
export const offConfigChanged = (fn) => {
    let idx = configListeners.indexOf(fn);
    if (idx >= 0) configListeners.splice(idx, 1);
}

const triggerConfigChanged = () => {
    configListeners.forEach(fn => fn(ServerConfig, Config));
}
export const updateConf = (backendBaseConf, backendCustomConf = {}) => {
    console.error('updateConf---',backendBaseConf,backendCustomConf);
    Object.assign(ServerConfig, buildServerConfig(APP_NAME, backendBaseConf, backendCustomConf));
    Object.assign(Config, backendBaseConf.config);
    triggerConfigChanged();
}

export const showScanDebugInfo = true;
