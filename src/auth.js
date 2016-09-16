import passport from 'passport';
import BearerStrategy from 'passport-http-bearer';
import {findByToken} from './users';

function finder(token, done) {
  const _done = done;
  
  done = (...args) => {
    _done(...args);
  };

  findByToken(token)
    .then((user) => done(null, user, {scope: 'all'}))
    .catch((e) => done(e));
}

passport.use(new BearerStrategy(finder));

export const isAuthenticated = passport.authenticate('bearer', { session: false });
