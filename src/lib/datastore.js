
const defaultDatastoreOptions = {};

export default function createDataStore(options = {}) {
  const datastoreOptions = Object.assign({}, defaultDatastoreOptions, options);
  
  const ds = {options: datastoreOptions};

  ds.start = () => Promise.resolve(ds);
  
  return ds;
}
