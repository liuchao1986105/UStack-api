import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import cors from 'cors';
import session from 'express-session';
import connectRedis from 'connect-redis';
import passport from 'passport';
import errorSendMiddleware from './middlewares/error_send';
import requestLog  from './middlewares/request_log';
import config from './config/env';
import Queue from './utils/queue';
// import mongooseLog from './middlewares/mongoose_log'; // 打印 mongodb 查询日志
if (config.env === 'development') {
  require('./middlewares/mongoose_log');
}

require('colors');
import bunyanConfig from './utils/logs';
import errorHandler from 'errorhandler';
import compression from 'compression';

const app = global.app = express();
const RedisStore = connectRedis(session);

class AppDelegate {
  constructor() {
    this._configApp();
  }

  run() {
    const httpServer =
      app.listen(config.port, () => {
        global.logger.info('Express server listening on port ' + config.port);
      });

      //websocket
    const io = require('socket.io')(httpServer,{'pingInterval': 15000});
    require('./utils/socket/index')(io);


    process.on('SIGTERM', () => {
      this.gracefullyExiting = true;

      global.logger.warn('Received kill signal (SIGTERM), shutting down');

      setTimeout(() => {
        global.logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 30 * 1000);

      httpServer.close(() => {
        global.logger.info('Closed out remaining connections.');
        process.exit();
      });

      global.scheduler.clear();

      global.queue.shutdown(5000, (err) => {
        global.logger.error(err);
      });
    });
  }

  _configApp() {
    require('./models');// 加载数据库
    require('./utils');
    this._configMiddleware();
    app.use('/api', require('./routes'));
  }

  _configMiddleware() {
    if (config.env === 'development') {
      // Request logger。请求时间
      app.use(requestLog);
    }

    app.use(errorSendMiddleware.errorSend);

    app.enable('trust proxy');
    const options = {
      origin: true,
      credentials: true,
    };

    app.use(cors(options));
    app.use(compression());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(methodOverride());
    app.use(cookieParser());
    app.use(session({
      secret: config.session.secrets,
      resave: false,
      saveUninitialized: false,
      store: new RedisStore({client: global.redis}),
      cookie: config.session.cookie,
    }));

    app.use(passport.initialize());

    app.use((req, res, next) => {
      if (req.cookies && req.cookies.access_token) {
        req.query = {...req.query, access_token: req.cookies.access_token}; // hack: use cookie to verify access_token
      }

      next();
    });

    Queue.configQueue(app);
  }

}

const delegate = new AppDelegate();
delegate.run();

exports = module.exports = app;
