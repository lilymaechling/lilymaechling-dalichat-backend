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
  })

// * User creation handled by authRouter

  // ! TESTING ONLY
  .delete(requireAuth, async (req, res) => {
    try {
      await Users.deleteMany({ });
      return res.status(200).json({ message: 'Successfully deleted all users.' });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  });

router.route('/:id')
  .get(async (req, res) => {
    try {
      const user = await Users.findById(req.params.id);
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
      const updatedUser = await Users.findOneAndUpdate({ _id: req.params.id }, req.body, { useFindAndModify: false, new: true });
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
