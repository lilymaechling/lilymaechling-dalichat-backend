/* eslint-disable func-names */
import passport from 'passport';
import LocalStrategy from 'passport-local';
import { Users } from '../models';

// Configure what LocalStrategy will check for as a username
const localOptions = {
  usernameField: 'username',
  passwordField: 'password',
};

// Make a login strategy to check username and password against DB
const localLogin = new LocalStrategy(localOptions, (username, password, done) => {
  return Users.findOne({ username }, (error, user) => {
    // Was a user with the given username able to be found?
    if (error) return done(error);
    if (!user) return done(null, false, { message: 'Username not associated with a user' });

    // Compare password associated with username and passed password
    return user.comparePassword(password, (err, isMatch) => {
      if (err) {
        done(err);
      } else if (!isMatch) {
        done(null, false, { message: 'Incorrect password' });
      } else {
        done(null, user);
      }
    });
  });
});

passport.use(localLogin);

/**
 * Creates function to validate "username" and "password" fields exist in a passed request body. If JWT is valid, includes corresponding user document in req.user field
 * @param {object} req express request object to parse for username
 * @param {object} res express response object to respond to with encountered errors
 * @param {Function} next function to pass errors to express' default error handler
 */
const requireSignin = function (req, res, next) {
  // Validation of parameters
  if (!req.body.username) {
    return res.status(400).json({ message: 'Username not included in request' });
  }

  if (!req.body.password) {
    return res.status(400).json({ message: 'Password not included in request' });
  }

  // eslint-disable-next-line prefer-arrow-callback
  return passport.authenticate('local', { session: false }, function (err, user, info) {
    // Return any existing errors
    if (err) { return next(err); }

    // If no user found, return appropriate error message
    if (!user) { return res.status(401).json({ message: info.message || 'Error authenticating username and password' }); }

    req.user = user;

    return next();
  })(req, res, next);
};

export default requireSignin;
