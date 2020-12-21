/* eslint-disable consistent-return */
import express from 'express';
import validator from 'email-validator';

import { userController } from '../controllers';
import { requireAuth, requireSignin } from '../authentication';
import { Users } from '../models';

import { getFieldNotFoundError } from '../helpers/constants';

const router = express();

router.route('/signup')
  .post(async (req, res) => {
    try {
      const {
        email, username, password, firstName, lastName,
      } = req.body;

      // Validate required fields
      if (!email || !validator.validate(email)) {
        return res.status(400).json({ message: 'Please enter a valid email address' });
      } else if (!username) {
        return res.status(400).json({ message: getFieldNotFoundError('username') });
      } else if (!password) {
        return res.status(400).json({ message: getFieldNotFoundError('password') });
      } else if (!firstName) {
        return res.status(400).json({ message: getFieldNotFoundError('firstName') });
      } else if (!lastName) {
        return res.status(400).json({ message: getFieldNotFoundError('lastName') });
      }

      // Check username or email address are already taken
      const emailIsTaken = !!(await Users.findOne({ email }));
      const usernameIsTaken = !!(await Users.findOne({ username }));
      if (emailIsTaken) { return res.status(409).json({ message: 'Email address is already associated to a user' }); }
      if (usernameIsTaken) { return res.status(409).json({ message: 'Username is already associated to a user' }); }

      // Make a new user from passed data
      const newUser = new Users({
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        password,
        firstName,
        lastName,
        posts: [],
      });

      // Save the user then transmit to frontend
      const savedUser = await newUser.save();
      const json = savedUser.toJSON();
      delete json.password;

      return res.status(201).json({ token: userController.tokenForUser(savedUser), user: json });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  });

// Send user object and server will send back authToken and user object
router.route('/signin')
  .post(requireSignin, (req, res) => {
    // This information is loaded into request object by passport
    const json = req.user.toJSON();
    delete json.password;

    return res.json({ token: userController.tokenForUser(json), user: json });
  });

router.route('/validate')
  .post(requireAuth, (req, res) => {
    const json = JSON.parse(JSON.stringify(req.user));
    delete json.password;
    res.status(200).json({ user: json });
  });

export default router;
