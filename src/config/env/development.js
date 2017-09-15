// 开发环境配置
// ==================================
module.exports = {
  host: 'http://localhost:8888',
  // 开发环境mongodb配置
  mongo: {
    uri: 'mongodb://localhost:27017/server-dev',
    mqtturi: 'mongodb://localhost:27017/mosca',
    //uri: 'mongodb://liuchao:jingjing1314@106.14.30.242:27017/lambda-server',
    options: {
      db: {
        safe: true,
      },
    },
  },
  // 开发环境redis配置  kue
  redis: {
    host: '127.0.0.1',
    port: 6379,
    // password: 'BEwm5gkXhuLh',
    // showFriendlyErrorStack: true,
    // db: 0,
  },

  cache: {
    host: '127.0.0.1',
    port: 6379,
    showFriendlyErrorStack: true,
    // db: 0,
  },

  seedDB: false,
  session: {
    cookie: {maxAge: 60000 * 5},
  },
};
