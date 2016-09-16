import errors from './errors';
import Collection from './../lib/collection';

//const DEFAULT_PHONE_VALIDATION_TTL = 24 * 60 * 60 * 1000; // 24 hrs in milliseconds.

const documents = new Collection(
  { id: 1,
    username: 'johnd',
    token: '123456789',
    name: {first: 'John', last: 'Doe'},
    email: 'john@example.com',
    telephone: '+40000000',
    valid: true,
  },
);

export const findByToken = (...args) => findOneByField('token', ...args);
export const findByTelephone = (...args) => findOneByField('telephone', ...args);
export const findByEmail = (...args) => findOneByField('email', ...args);
export const findByUsername = (...args) => findOneByField('username', ...args);

/**
 * Finds an user by a given unique field.
 *
 * @param {String} name The field name to search the user by.
 * @param {String} value The field value.
 * @return Promise
 */
export function findOneByField(field, value) {
  return new Promise((resolve, reject) => {
    const user = documents.findByProperty(field, value);
    if (user) {
      resolve(user);
    } else {
      reject(new errors.UserNotFoundError());
    }
  });
}

/**
 * Register a new user.
 *
 * @return Promise
 */
export function register(fields = {}) {
  // First we need to aquire a lock, to allow for atomic operations on the collection.
  
  return documents.acquireLock().then((lock) => {
    // Lock obtained.
    
    // create a function that will release the lock, and return a rejection promise.
    const releaseLockOnThrow = (e) => { lock.release(); return Promise.reject(e); };
    
    // Extract the fields.
    const {firstName, lastName, telephone, email, username} = fields;
    
    // Validate the phone number, and register the user, or release the lock and reject.
    return Promise.resolve(telephone)
            .then(validateTelephoneNumber)
            .then(throwIfUserExists)
            .then(registerUser, releaseLockOnThrow);
    
    // Function that will throw an exception if the user (by telephone) already exists.
    function throwIfUserExists(tel) {
      return findByTelephone(tel).then(function() { throw new errors.UserExistsError(); }, (e) => tel);
    }
    
    // Function that will register the user, unless invalid fields.
    function registerUser(telephone) {
      // Several validation promises.
      return Promise.all([
        Promise.resolve(firstName).then(validateName),
        Promise.resolve(lastName)
      ]).then(([firstName, lastName]) => {
        // Create a new user entry object.
        const entry = {name: {first: firstName, last: lastName}, email, telephone, username, valid: false};
        
        // Insert the entry, release the lock, and return the last document inserted (the updated entry).
        return documents[lock.insert(entry).release().collection.length - 1];
      });
    }
    
  });
}

/**
 * Function that validates a name (first or last)
 *
 * @param {String} name The name to validate. Must be a string, with length greater than 1.
 * @throws {MissingNameFieldError, InvalidNameFieldError}
 * @return {String} the valid name.
 */
function validateName(name) {
  if (typeof name !== 'string') {
    throw new errors.MissingFirstNameError();
  }
  
  // Trim the string.
  name = name.trim();
  
  if (name.length <= 1) {
    throw new errors.InvalidFirstNameError();
  }
  
  return name;
}

/**
 * Function that validates a telephone number.
 *
 * @param {String} name The telephone number to validate. Must be a string of digits.
 * @throws {MissingTelephoneNumber, InvalidTelephoneError}
 * @return {String} the valid name.
 */
function validateTelephoneNumber(telephone) {
  if (typeof telephone !== 'string') {
    throw new errors.MissingTelephoneError();
  }
  
  // Replace any non-digit character. Leaves '+' characters.
  telephone = telephone.trim().replace(/[^\d\+]+/g, '');
  
  if (telephone.length < 9) {
    throw new errors.InvalidTelephoneError();
  }
  
  return telephone;
}
