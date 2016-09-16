import * as fs from 'fs';

const DEFAULT_CONFIG_PATH = `${process.cwd()}/.config.json`;

const reader = (options) => {
  if (typeof options === 'object' && options !== null) {
    return {
      read(...args) {
        return reader.read(...args).then((result) => Object.assign({}, options, result));
      }
    };
  } else {
    return reader;
  }
};

reader.read = read;

function read(path = DEFAULT_CONFIG_PATH) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (!err) {
        let config;
        
        try {
          config = JSON.parse(data.toString());
        } catch (e) {
          reject(err);
          return;
        }
        
        resolve(config);
      } else {
        reject(err);
      }
    });
  });
}

export default reader;
