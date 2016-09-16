import createDebug from 'debug';

const debug = createDebug('LOG');

debug.create = createDebug;
debug.info = createDebug('INFO');
debug.warn = createDebug('WARN');
debug.error = createDebug('ERROR');

export default debug;
