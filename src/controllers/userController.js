import mongoose from 'mongoose';
import jwt from 'jwt-simple';
import validator from 'email-validator';

import { Users } from '../models';
import {
  DocumentNotFoundError,
  IncompleteRequestError,
  UniqueFieldError,
} from '../errors';

export const create = async ({
  email,
  username,
  password,
  firstName,
  lastName,
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

  if (emailIsTaken) {
    throw new UniqueFieldError('email', email);
  }
  if (usernameIsTaken) {
    throw new UniqueFieldError('username', username);
  }

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
  if (!foundUser) {
    throw new DocumentNotFoundError(id);
  }
  return foundUser;
};

export const update = async (id, fields) => {
  const {
    email,
    username,
    firstName,
    lastName,
    profileUrl,
    backgroundUrl,
    portfolioUrl,
    blurb,
    password,

    isAdmin,
    isVerified,
    posts,
    numPosts,
  } = fields;

  const foundUser = await read(id);

  // Save field updates
  if (email) {
    foundUser.email = email;
  }
  if (username) {
    foundUser.username = username;
  }
  if (password) {
    foundUser.password = password;
  }
  if (firstName) {
    foundUser.firstName = firstName;
  }
  if (lastName) {
    foundUser.lastName = lastName;
  }
  if (profileUrl) {
    foundUser.profileUrl = profileUrl;
  }
  if (backgroundUrl) {
    foundUser.backgroundUrl = backgroundUrl;
  }
  if (portfolioUrl) {
    foundUser.portfolioUrl = portfolioUrl;
  }
  if (blurb) {
    foundUser.blurb = blurb;
  }

  if (isAdmin) {
    foundUser.isAdmin = isAdmin;
  }
  if (isVerified) {
    foundUser.isVerified = isVerified;
  }
  if (posts) {
    foundUser.posts = posts;
  }
  if (numPosts) {
    foundUser.numPosts = numPosts;
  }

  // Save changes
  const updatedUser = (await foundUser.save()).toJSON();
  delete updatedUser.password;
  return updatedUser;
};

export const remove = async (id) => {
  const foundUser = await read(id);
  if (!foundUser) {
    throw new DocumentNotFoundError(id);
  }
  return foundUser.remove();
};

export const readAll = async () => {
  return Users.find({}, { password: 0 });
};

export const tokenForUser = (uid) => {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: uid, iat: timestamp }, process.env.AUTH_SECRET);
};
