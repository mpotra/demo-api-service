import createServer from './server';
import createNexmo from './nexmo';
import createDatastore from './datastore';
import logger from './log';
import routes from './../routes';

export default function createApplication(options = {}) {

  const app = {name: options.name};

  const log = app.log = options.log || logger;
  const server = app.server = createServer(options.server);
  const nexmo = app.nexmo = createNexmo(options.nexmo);
  const datastore = app.datastore = createDatastore(options.datastore);
    
  server.use((req, res, next) => {
    req.app = app;
    req.nexmo = nexmo;
    req.datastore = datastore;
    req.log = log;
    return next();
  });

  routes.install(app);
  
  app.start = () => {
    return Promise.all([
      server.start(),
      datastore.start()
    ]);
  };
  
  log.info('Application created');
  
  return app;
}
