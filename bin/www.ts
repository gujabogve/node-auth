import os from 'os';
import cluster from 'cluster';
import { logger } from '../src/logger';
const threadsCount = Number(process.env.THREADS_COUNT) || os.cpus().length / 2;
const port = process.env.PORT || 3000;

if (cluster.isMaster) {
  console.log(`Master PID is ${process.pid}`);
  for (let i = 0; i < threadsCount; i++) {
    cluster.fork();
  }
} else if (cluster.isWorker) {
  const app = require('../src/app').default;
  app
    .listen(port, () => {
      console.log('Server started on port %d', port, 'PID = ' + process.pid);
    })
    .on('error', logger.error.bind(logger));
}

process.on('uncaughtException', (err) => {
  logger.error(err);
  logger.info('Node NOT Exiting...');
});
