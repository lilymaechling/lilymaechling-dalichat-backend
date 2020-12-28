// eslint-disable-next-line no-unused-vars
import mongoose from 'mongoose';
import jwt from 'jwt-simple';
import validator from 'email-validator';

import { Users } from '../models';
import {
  BadCredentialsError, DocumentNotFoundError, IncompleteRequestError, UniqueFieldError,
} from '../errors';

/**
 * Creates a new user and saves it to the database
 *
 * @async
 * @param {object} param0 required fields to create a user
 * @returns {Promise<object>} resolves saved user object
 * @throws {IncompleteRequestError} throws if required fields aren't included or if email is invalid
 * @throws {UniqueFieldError} throws if passed email or username fields aren't unique in the database
 */
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

/**
 * Returns the user document with passed id
 *
 * @async
 * @param {mongoose.Types.ObjectId | string} id id of user document to return
 * @returns {Promise<object>} resolves found user document
 * @throws {DocumentNotFoundError} throws if no user document exists with passed id
 */
export const read = async (id) => {
  const foundUser = await Users.findOne({ _id: id }, { password: 0 });
  if (!foundUser) { throw new DocumentNotFoundError(id); }
  return foundUser;
};

/**
 * Updates user document with passed id
 *
 * @async
 * @param {mongoose.Types.ObjectId | string} id id of user document to update
 * @param {object} fields key:value pairs to update on found user document
 * @param {string} authPassword password verification (needed to change "password" field on user, else optional)
 * @returns {Promise<object>} resolves updated user document
 * @throws {BadCredentialsError} throws if authPassword field doesn't match stored password
 * @throws {DocumentNotFoundError} throws if no user document exists with passed id
 */
export const update = async (id, fields, authPassword = '') => {
  const {
    email, username, firstName, lastName,
    profileUrl, backgroundUrl, portfolioUrl,
    blurb, password,

    isAdmin, isVerified, posts, numPosts,
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

  if (isAdmin) { foundUser.isAdmin = isAdmin; }
  if (isVerified) { foundUser.isVerified = isVerified; }
  if (posts) { foundUser.posts = posts; }
  if (numPosts) { foundUser.numPosts = numPosts; }

  // Save changes
  const updatedUser = (await foundUser.save()).toJSON();
  delete updatedUser.password;
  return updatedUser;
};

/**
 * Removes user document with passed id
 *
 * @async
 * @param {mongoose.Types.ObjectId | string} id id of user document to remove
 * @returns {Promise<object>} resolves MongoDB removal status object
 * @throws {DocumentNotFoundError} throws if no user document exists with passed id
 */
export const remove = async (id) => {
  const foundUser = await read(id);
  if (!foundUser) { throw new DocumentNotFoundError(id); }
  return foundUser.remove();
};

/**
 * Returns all documents in "users" collection
 *
 * @async
 * @returns {Promise<object[]>} resolves array of found user documents
 */
export const readAll = async () => {
  return Users.find({}, { password: 0 });
};

/**
 * Generates JWT authentication token for user based on passed uid
 *
 * @param {mongoose.Types.ObjectId | string} uid id of user to generate auth token for
 * @returns {string} generated JWT token
 */
export const tokenForUser = (uid) => {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: uid, iat: timestamp }, process.env.AUTH_SECRET);
};
