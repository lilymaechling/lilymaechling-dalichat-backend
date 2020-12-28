import express from 'express';

import { Users } from '../models';

import { requireAuth } from '../authentication';
import { documentNotFoundError, getSuccessfulDeletionMessage } from '../helpers/constants';

const router = express();

router.use(requireAuth);

// find and return all users
router.route('/')
  .get(async (req, res) => {
    try {
      const users = await Users.find({});

      // Delete sensitive information from the sent user objects
      const cleanedUsers = await Promise.all(users.map((user) => {
        return new Promise((resolve) => {
          const newUser = user.toJSON();
          delete newUser.password;
          resolve(newUser);
        });
      }));

      return res.status(200).json(cleanedUsers);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  });

// * User creation handled by authRouter

// * Server does not support deleting all users

router.route('/:id')
  .get(async (req, res) => {
    try {
      const user = await Users.find({ _id: req.params.id });
      const json = user.toJSON();
      delete json.password;
      return res.status(200).json(json);
    } catch (error) {
      if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: documentNotFoundError });
      } else {
        return res.status(500).json({ message: error.message });
      }
    }
  })

  .put(async (req, res) => {
    try {
      const {
        email, username, firstName, lastName, profileUrl, backgroundUrl, portfolioUrl, blurb, // * Only allow these fields to be updated
        authPassword, // ! Do not update these fields
        password, // ! Update these fields securely (needs verification match)
      } = req.body;

      const foundUser = await Users.findById(req.params.id);

      // Update password only if password matches
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
          return res.status(401).json({ message: 'Invalid authentication' });
        } else {
          foundUser.markModified('password'); // ? Why is this needed to rehash password?
          foundUser.password = password;
        }
      }

      if (email) { foundUser.email = email; }
      if (username) { foundUser.username = username; }
      if (firstName) { foundUser.firstName = firstName; }
      if (lastName) { foundUser.lastName = lastName; }
      if (profileUrl) { foundUser.profileUrl = profileUrl; }
      if (backgroundUrl) { foundUser.backgroundUrl = backgroundUrl; }
      if (portfolioUrl) { foundUser.portfolioUrl = portfolioUrl; }
      if (blurb) { foundUser.blurb = blurb; }

      // Else update all passed fields (no update if undefined)
      const updatedUser = await foundUser.save();
      const json = updatedUser.toJSON();
      delete json.password;
      return res.status(200).json(json);
    } catch (error) {
      if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: documentNotFoundError });
      } else {
        return res.status(500).json({ message: error.message });
      }
    }
  })

  .delete(async (req, res) => {
    try {
      await Users.findOneAndDelete({ _id: req.params.id }, { useFindAndModify: false });
      return res.json({ message: getSuccessfulDeletionMessage(req.params.id) });
    } catch (error) {
      if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: documentNotFoundError });
      } else {
        return res.status(500).json({ message: error.message });
      }
    }
  });

export default router;
