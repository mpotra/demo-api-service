import restify from 'restify';
import * as plugins from 'restify-plugins';
import bunyan from 'bunyan';
import LOG from './log';

// Define default application host and port
const defaultServerOptions = {
  host: process.env.HOST || '127.0.0.1',
  port: process.env.PORT || 80,
  name: 'demo-app',
  log: LOG,
  version: '1.0.0'
};

export default function createServer(options = {}) {

  const serverOptions = Object.assign({}, defaultServerOptions, options);
  
  const {name, log, host, port} = serverOptions;

  // Create a server with our logger and custom formatter
  const server = restify.createServer(serverOptions);
  
  server.options = serverOptions;
  
  /* Enable pre middleware */

  // Ensure we don't drop data on uploads
  server.pre(plugins.pre.pause());

  // Clean up sloppy paths like //todo//////1//
  server.pre(plugins.pre.dedupeSlashes());

  // Handles annoying user agents (curl)
  server.pre(plugins.pre.userAgentConnection());

  /* Enable middleware */
  server.use(plugins.acceptParser(server.acceptable));
  server.use(plugins.authorizationParser());
  server.use(plugins.queryParser());
  server.use(plugins.bodyParser());

  /* Enable the audit logger */
  server.on('after', plugins.auditLogger({
    body: true,
    log: bunyan.createLogger({
      name: name + '-audit',
      streams: [{
        level: 'info',
        stream: process.stdout
      }]
    })
  }));

  // Set a per request bunyan logger (with requestid filled in)
  server.use(plugins.requestLogger());

  // Allow 5 requests/second by IP, and burst to 10
  server.use(plugins.throttle({
    burst: 10,
    rate: 5,
    ip: true
  }));

  /*
  // Start listening on host and port provided by the environment or defaults.
  server.listen(port, host, () => {
    LOG.info('%s listening at %s', server.name, server.url);
  });
  */
  
  server.get('/', (req, res, next) => {
    res.send({data: 'all good'});
    next();
  });

  server.start = () => {
    return new Promise((resolve, reject) => {
      server.listen(port, host, () => {
        log.info(`HTTP server listening on ${host}:${port}`);
        resolve(server);
      });
    });
  };
  
  return server;
}
