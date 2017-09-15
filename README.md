# uconnect-api 
预付费云系统Api


## 简介
##### 此项目为预付费云系统各个客户端提供api. 

## 环境准备
```
node.js 4.0+
mognodb 3.0+
redis 2.8+
```

## 配置
* 配置文件路径: ./src/config/env, 可将私有配置放入./src/config/env/private 下. 

```
  qiniu:{
    app_key:"app_key",
    app_secret:"app_secret",
    domain:"domain",          //七牛配置域名
    bucket:"bucket"           //七牛空间名称  
  },
```

## 开发
```
$ git clone "git地址"
$ cd uconnect-api
$ npm install
$ npm run build
$ npm run run-test
```

### 本地真实环境测试  
 
```
$ gulp clean
$ npm run build
$ npm run start
```


## [windows 用户注意事项](#windows)
经亲测windows上开发没有任何问题, 测试环境如下:
- windows 7 64位
- mongodb 3.2.6
- [redis 2.8.24](https://github.com/MSOpenTech/redis/releases)
- Python 2.7
- Microsoft Visual Studio C++ 2013

1, node-gyp  
一定要全局安装好node-gyp, ```npm i -g node-gyp```  
这个库依赖python 2.7, vs2013. c++编译环境一定要配置好, 不然很多包都装不了.

2, redis  
redis for windows 只支持64位的操作系统 

## 线上布署
```
$ pm2 start process.json
```
可参考[利用git和pm2一键布署项目到vps](http://jackhu.top/article/55cd8e00c6e998b817a930c7)


### 使用docker容器部署所需的要环境变量
```
MONGO_PORT_27017_TCP_ADDR
MONGO_USERNAME
MONGO_PASSWORD
REDIS_PORT_6379_TCP_ADDR
REDIS_PORT_6379_TCP_PORT
REDIS_PASSWORD
QINIU_APP_KEY
QINIU_APP_SECRET
QINIU_APP_DOMAIN
QINIU_APP_BUCKET
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
GITHUB_CALLBACK_URL
WEIBO_CLIENT_ID
WEIBO_CLIENT_SECRET
WEIBO_CALLBACK_URL
QQ_CLIENT_ID
QQ_CLIENT_SECRET
QQ_CALLBACK_URL
```


## 测试
```
$ gulp test
```

##配合客户端测试的测试模式   
 
```
$ gulp serve:test
```

## License
MIT