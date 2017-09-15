import kue from 'kue';
import ui from 'kue-ui';
import Redis from 'ioredis';

import config from '../../config/env';

global.queue = kue.createQueue({
  redis: {
    createClientFactory: () => {
      return new Redis(config.redis);
    },
  },
});

global.queue.on('error', (err) => {
  global.logger.error(err, 'queue Oops...');
});

export default class Queue {
  static createQueue() {
  }

  static configQueue(app) {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    ui.setup({
      apiURL: '/kue/api', // IMPORTANT: specify the api url
      baseURL: '/kue/ui', // IMPORTANT: specify the base url
      //updateInterval: 5000, // Optional: Fetches new data every 5000 ms
    });

    // Mount kue JSON api
    app.use('/kue/api', kue.app);

    // Mount UI
    app.use('/kue/ui', ui.app);
  }

  static addJob(jobName, params, process, delay = 0, priority = 'normal') {
    const job = global.queue.create(jobName, params).priority(priority).delay(delay).save((err) => {
      if (err) {
        global.logger.error(err, 'Oops... addJob');
        return;
      }
      console.log( "job.id:"+job.id );
    });

    global.queue.process(jobName, (job, done) => {
      process(job);
      done();
    });
  }
}
