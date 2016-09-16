const symLastId = Symbol('lastId');
const symCurrentLock = Symbol('currentLock');

export default class Collection extends Array {
  constructor(...args) {
    super(...args);
    this[symLastId] = this.length;
  }

  acquireLock() {
    const collection = this;
    if (!collection[symCurrentLock]) {
      let fnRelease;
      let released = false;
      
      const lock = {
        id: Date.now(),
        collection,
        get released() {
          return released;
        },
        get lastId() {
          return collection[symLastId];
        }
      };
      
      const promise = new Promise((resolve, reject) => {
        fnRelease = function() {
          
          if (!released) {
            released = true;
            collection[symCurrentLock] = undefined;
            resolve();
          }
          
          return lock;
        };
      });
      
      lock.promise = promise;
      lock.release = fnRelease;
      lock.insert = (...args) => { push(collection, ...args); return lock; };
      
      return Promise.resolve(collection[symCurrentLock] = lock);
    } else {
      return collection[symCurrentLock].promise.then(() => collection.acquireLock());
    }
  }
  
  insert(entry) {
    return this.acquireLock().then((lock) => lock.insert(entry).release().lastId);
  }
  
  filterByProperty(field, value) {
    return this.filter((doc) => doc[field] === value);
  }
  
  findByProperty(field, value) {
    return this.find((doc) => doc[field] === value);
  }
}

function push(collection, entry) {
  // Generate the next ID. Not using collection.length, in order to avoid id collisions.
  const id = collection[symLastId] + 1;
  // Create a new doc, with the id appended.
  const document = Object.assign({}, entry, {id, created: new Date()});
  
  // Add the document to the array.
  const index = Array.prototype.push.call(collection, document);
  
  // Immediatelly update the `lastId` to the current id.
  collection[symLastId] = id;
  
  return index;
}
