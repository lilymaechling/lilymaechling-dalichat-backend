import express from 'express';
import mongoose from 'mongoose';

import { Posts, Users } from '../models';
import { requireAuth } from '../authentication';
import { documentNotFoundError, getFieldNotFoundError, getSuccessfulDeletionMessage } from '../helpers/constants';

const router = express();

// find and return all resources
router.route('/')
  .get(requireAuth, async (req, res) => {
    try {
      const posts = await Posts.find({});
      return res.status(200).json({ posts });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  })

  .post(requireAuth, async (req, res) => {
    try {
      const resource = new Posts();
      const { content, uid } = req.body;

      if (!content) return res.status(400).json({ message: getFieldNotFoundError('content') });
      if (!uid) return res.status(400).json({ message: getFieldNotFoundError('uid') });

      resource.content = content;
      resource.likes = [];
      resource.numLikes = 0;
      resource.postDate = Date.now();
      resource.owner = uid;

      const savedPost = await resource.save();

      const owner = await Users.findOne({ _id: savedPost.owner });
      owner.posts.push(savedPost._id);
      const savedOwner = await owner.save();

      const json = savedOwner.toJSON();
      delete json.password;

      return res.status(201).json({ post: savedPost, owner: savedOwner });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  });

// // ! TESTING ONLY
// .delete(requireAuth, async (req, res) => {
//   try {
//     await Resources.deleteMany({ })
//     return res.status(200).json({ message: 'Successfully deleted all resources.' });
//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// });

router.route('/:id')
  .get(async (req, res) => {
    try {
      const post = await Posts.findById(req.params.id);
      return res.status(200).json({ post });
    } catch (error) {
      if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: documentNotFoundError });
      } else {
        return res.status(500).json({ message: error.message });
      }
    }
  })

  .put(requireAuth, async (req, res) => {
    try {
      // TODO: limit fields request can update
      const post = await Posts.findOneAndUpdate({ _id: req.params.id }, req.body, { useFindAndModify: false, new: true });
      return res.status(200).json({ post });
    } catch (error) {
      if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: documentNotFoundError });
      } else {
        return res.status(500).json({ message: error.message });
      }
    }
  })

  .delete(requireAuth, async (req, res) => {
    try {
      // Find and verify valid post id (pid)
      const foundPost = await Posts.findOne({ _id: req.params.id });
      if (!foundPost) return res.status(404).json({ message: documentNotFoundError });

      // Find and verify valid owner
      const owner = await Users.findOne({ _id: foundPost.owner });
      if (!owner) throw new Error('Post has no specified owner');

      // Remove pid from owner's "posts" array
      owner.posts = owner.posts.filter((pid) => { return pid !== req.params.id; });
      const savedOwner = await owner.save();

      // Remove password from owner object
      const json = savedOwner.toJSON();
      delete json.password;

      // Delete post
      await Posts.findOneAndDelete({ _id: req.params.id }, { useFindAndModify: false });
      return res.status(200).json({ owner: json, message: getSuccessfulDeletionMessage(req.params.id) });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  });

// Posts for a given user
router.route('/user/:id')
  .get(requireAuth, async (req, res) => {
    try {
      const posts = await Posts
        .find({ owner: req.params.id })
        .sort({ postDate: -1 })
        .limit(5)
        .populate({
          path: 'owner',
          select: '-password',
        });

      const resultIds = posts.map((r) => { return r._id; });

      return res.status(200).json({ results: posts, resultIds, numResults: posts.length });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  });

// Likes a post for a passed uid
router.route('/like/:id')
  .post(requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { uid } = req.body;

      const foundPost = await Posts.findOne({ _id: id });
      if (!foundPost) return res.status(404).json({ message: `Post with uid ${id} not found` });

      // Validate "uid" field
      if (!uid) return res.status(400).json({ message: getFieldNotFoundError('uid') });
      const foundUser = await Users.findById({ _id: uid });
      if (!foundUser) return res.status(400).json({ message: `User with uid ${uid} not found` });

      // Update post
      const unliking = foundPost.likes.some((l) => { return l.toString() === uid; });

      if (unliking) {
        foundPost.likes = foundPost.likes.filter((e) => { return e._id.toString() !== uid; });
      } else {
        foundPost.likes = foundPost.likes.slice();
        foundPost.likes.push(new mongoose.Types.ObjectId(uid));
      }

      // Save doc and populate
      const savedPost = await foundPost.save();
      const populatedPost = await Posts.populate(savedPost, { path: 'owner', select: '-password' });

      return res.status(200).json({ post: populatedPost });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  });

export default router;
