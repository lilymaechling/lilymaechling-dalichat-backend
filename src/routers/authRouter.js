/* eslint-disable consistent-return */
import express from 'express';

import { userController } from '../controllers';
import { requireAuth, requireSignin } from '../authentication';

const router = express();

router.route('/signup')
  .post(async (req, res, next) => {
    try {
      const {
        email, username, password, firstName, lastName,
      } = req.body;

      const user = await userController.create({
        email, username, password, firstName, lastName,
      });

      return res.status(201).json({ token: userController.tokenForUser(user._id), user });
    } catch (error) {
      return next(error);
    }
  });

// Send user object and server will send back authToken and user object
router.route('/signin')
  .post(requireSignin, (req, res, next) => {
    try {
      // This information is loaded into request object by passport
      const user = req.user.toJSON();
      delete user.password;

      return res.status(200).json({ token: userController.tokenForUser(user._id), user });
    } catch (error) {
      return next(error);
    }
  });

router.route('/validate')
  .post(requireAuth, (req, res, next) => {
    try {
      // This information is loaded into request object by passport
      const user = req.user.toJSON();
      delete user.password;

      res.status(200).json({ user });
    } catch (error) {
      return next(error);
    }
  });

export default router;
