// 生产环境配置
// =================================
module.exports = {
  // 生产环境mongodb配置
  host:'http://www.ustack.com',
  mongo: {
    uri: 'mongodb://ustack:ustack1314@106.14.30.242:27017/ustack-server',
    mqtturi: 'mongodb://ustack:ustack1314@106.14.30.242:27017/mosca',
    // "mongodb://capricorn:EBN5dKcHpGzqg4i9J9Gw8O@101.200.134.85:32772/wddb",
    options: {
      db: {
        safe: true,
      },
      // user:'user',          //生产环境用户名
      // pass:'pass'           //生产环境密码
    },
  },
  // 生产环境redis配置  kue
  redis: {
    host: '106.14.30.242',  //host: 'redis',   // Redis host
    port: 6379,
    password: 'jingjing1314',
    db: 1,
  },

  cache: {
    host: '127.0.0.1',
    port: 6379,
    showFriendlyErrorStack: true,
    // db: 0,
  },

  // 生产环境cookie是否需要domain视具体情况而定.
  session: {
   // cookie: {maxAge: 60000 * 5, domain:'.ustack.com'},
   cookie: {maxAge: 60000 * 5, domain:''},
  },
};
