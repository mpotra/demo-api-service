import * as auth from './auth';
import * as Users from './users';
import generatePin from './lib/pincode';

export function install(application) {
  const server = application.server;
  
  server.get('/me', auth.isAuthenticated, function(req, res, next) {
    const {user} = req;
    res.send(user);
    next();
  });
  
  server.get('/users/:tel', auth.isAuthenticated, function(req, res, next) {
    Users.findByTelephone(req.params.tel).then((user) => {
      res.send(user);
      next();
    }).catch(next);
  });
  
  server.post('/users', function(req, res, next) {
    req.log.info('request parameters:', req.body);
    Users.register(req.body).then((user) => {
      res.send(user);
      next();
      setImmediate(() => sendVerificationSMS(application, user, generatePin(4)));
    }).catch(next);
  });
}

const routes = {install};

export default routes;

function sendVerificationSMS(application, user = {}, paramPin) {
  const {telephone, name: {first = 'user'}, pin = paramPin} = user;
  const log = application.log;
  const nexmo = application.nexmo;
  const from = 'MyDemoApp';
  const to = telephone;
  const message = `Dear ${first}, your verification code for ${from} is ${pin}. Expires in 5 minutes.`;
  
  return nexmo.sms.send({from, to, message})
        .then((a) => log.info('SMS Successfully Sent:', a), (e) => log.warn('SMS Error:', e));
}
