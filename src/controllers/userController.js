import jwt from 'jwt-simple';
import validator from 'email-validator';

import { Users } from '../models';
import {
  BadCredentialsError, DocumentNotFoundError, IncompleteRequestError, UniqueFieldError,
} from '../errors';

export const create = async ({
  email, username, password, firstName, lastName,
}) => {
  // Validate required fields
  if (!email || !validator.validate(email)) {
    throw new IncompleteRequestError('email', 'invalid');
  } else if (!username) {
    throw new IncompleteRequestError('username');
  } else if (!password) {
    throw new IncompleteRequestError('password');
  } else if (!firstName) {
    throw new IncompleteRequestError('firstName');
  } else if (!lastName) {
    throw new IncompleteRequestError('lastName');
  }

  // Check username or email address are already taken
  const emailIsTaken = !!(await Users.findOne({ email }));
  const usernameIsTaken = !!(await Users.findOne({ username }));

  if (emailIsTaken) { throw new UniqueFieldError('email', email); }
  if (usernameIsTaken) { throw new UniqueFieldError('username', username); }

  // Make a new user from passed data
  const newUser = new Users({
    email: email.toLowerCase(),
    username: username.toLowerCase(),
    password,
    firstName,
    lastName,
    posts: [],
  });

  // Save and return user
  const savedUser = (await newUser.save()).toJSON();
  delete savedUser.password;
  return savedUser;
};

export const read = async (id) => {
  const foundUser = await Users.findOne({ _id: id }, { password: 0 });
  if (!foundUser) { throw new DocumentNotFoundError(id); }
  return foundUser;
};

export const update = async (id, fields, authPassword = '') => {
  const {
    email, username, firstName, lastName,
    profileUrl, backgroundUrl, portfolioUrl,
    blurb, password,
  } = fields;

  const foundUser = await read(id);

  // ! Update password only if passed authPassword matches saved password
  if (password) {
    // Determine if authPassword matches actual password
    const passwordsMatch = await new Promise((resolve, reject) => {
      foundUser.comparePassword(authPassword, (error, same) => {
        if (error) reject(error);
        else resolve(same);
      });
    });

    // Reject update if passwords don't match
    if (!passwordsMatch) {
      throw new BadCredentialsError('Passed credentials don\'t match stored credentials');
    } else {
      foundUser.markModified('password'); // ? Why is this needed to rehash password?
      foundUser.password = password;
    }
  }

  // Save field updates
  if (email) { foundUser.email = email; }
  if (username) { foundUser.username = username; }
  if (firstName) { foundUser.firstName = firstName; }
  if (lastName) { foundUser.lastName = lastName; }
  if (profileUrl) { foundUser.profileUrl = profileUrl; }
  if (backgroundUrl) { foundUser.backgroundUrl = backgroundUrl; }
  if (portfolioUrl) { foundUser.portfolioUrl = portfolioUrl; }
  if (blurb) { foundUser.blurb = blurb; }

  // Save changes
  const updatedUser = (await foundUser.save()).toJSON();
  delete updatedUser.password;
  return updatedUser;
};

export const remove = async (id) => {
  const foundUser = await read(id);
  if (!foundUser) { throw new DocumentNotFoundError(id); }
  return foundUser.remove();
};

export const readAll = async () => {
  return Users.find({}, { password: 0 });
};

export const tokenForUser = (user) => {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, process.env.AUTH_SECRET);
};
