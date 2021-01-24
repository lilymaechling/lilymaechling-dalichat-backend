/* eslint-disable func-names */
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import dotenv from 'dotenv';

import { Users } from '../models';

dotenv.config({ silent: true });

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.AUTH_SECRET,
};

const jwtLogin = new JwtStrategy(jwtOptions, (payload, done) => {
  // See if the token matches any user document in the DB
  // Done function in the form -> "done(resulting error, resulting user)"
  Users.findById(payload.sub, (err, user) => {
    // * This logic can be modified to check for user attributes
    if (err) {
      return done(err, false); // Error return
    } else if (user) {
      return done(null, user); // Valid user return
    } else {
      return done(null, false); // Catch no valid user return
    }
  });
});

passport.use(jwtLogin);

/**
 * Creates function to validate valid JWT Bearer token is included in "Authentication" header. If JWT is valid, includes corresponding user document in req.user field
 * @param {object} req express request object to parse for username
 * @param {object} res express response object to respond to with encountered errors
 * @param {Function} next function to pass errors to express' default error handler
 */
const requireAuth = function (req, res, next) {
  // eslint-disable-next-line prefer-arrow-callback
  passport.authenticate('jwt', { session: false }, function (err, user, info) {
    // Return any existing errors
    if (err) { return next(err); }

    // If no user found, return appropriate error message
    if (!user) { return res.status(401).json({ message: info.message || 'Error authenticating jwt' }); }

    req.user = user;

    return next();
  })(req, res, next);
};

export default requireAuth;
