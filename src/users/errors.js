import errors from 'restify-errors';

errors.makeConstructor('UserExistsError', {
  statusCode: 409,
  restCode: 'UserExists',
  message: 'User already exists'
});

errors.makeConstructor('UserNotFoundError', {
  statusCode: 404,
  restCode: 'UserNotFound',
  message: 'User was not found'
});

errors.makeConstructor('MissingTelephoneError', {
  statusCode: 409,
  restCode: 'MissingTelephone',
  message: '"telephone" field is required.'
});

errors.makeConstructor('InvalidTelephoneError', {
  statusCode: 409,
  restCode: 'InvalidTelephone',
  message: 'Invalid "telephone" field parameter.'
});

errors.makeConstructor('MissingFirstNameError', {
  statusCode: 409,
  restCode: 'MissingFirstName',
  message: '"firstName" field is required.'
});

errors.makeConstructor('InvalidFirstNameError', {
  statusCode: 409,
  restCode: 'InvalidFirstName',
  message: 'Invalid "firstName" field parameter.'
});

export default errors;
