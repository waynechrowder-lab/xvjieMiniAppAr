const { updateConf } = require("./service/config");
import WxApp from "./app";

const engine = requirePlugin("SPAREngine");
requirePlugin("SPARPlugin").inject(engine);

const setApp = async (opt, property) => {
  updateConf({ mallnavigation: opt });
  const app = WxApp.getApp();
  return await app.launch(property);
};

module.exports = {
  setApp,
};
