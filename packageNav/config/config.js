const config = require("./config.prod");
const mockConfig = require("./config.mock-none");
module.exports = {
  env: 'prod',
  host: 'http://10.10.51.4:8081',
  // host: 'http://10.10.31.56:8081',
  ...config,
  ...mockConfig,
}