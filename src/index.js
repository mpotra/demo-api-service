import 'bluebird';
import createApp from './lib/app';
import configReader from './lib/configReader';
import log from './lib/log';

function readConfig(opts) {
  return configReader(opts).read().catch((e) => {
    log.warn('Missing local .config.json: Creating application with default values');
    return {};
  });
}

readConfig({log})
  .then(createApp)
  .then((app) => app.start())
  .then(() => log.info('Application started'), (e) => log.error(e));
