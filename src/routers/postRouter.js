import express from 'express';

import { requireAuth } from '../authentication';
import { getSuccessfulDeletionMessage } from '../helpers/constants';
import { postController } from '../controllers';

const router = express();

// find and return all resources
router.route('/')
  .get(requireAuth, async (_req, res) => {
    try {
      const posts = await postController.readAll();
      return res.status(200).json({ posts });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  })

  .post(requireAuth, async (req, res, next) => {
    try {
      const { content, uid } = req.body;
      const { post, owner } = await postController.create({ content, uid });
      return res.status(201).json({ post, owner });
    } catch (error) {
      return next(error);
    }
  });

router.route('/:id')
  .get(async (req, res, next) => {
    try {
      const { id } = req.params;
      const post = await postController.read(id);
      return res.status(200).json({ post });
    } catch (error) {
      return next(error);
    }
  })

  .put(requireAuth, async (req, res, next) => {
    try {
      const { id } = req.params;

      // Limits the fields a user request can update while allowing the controller to update any valid field
      const { content } = req.body;

      const post = await postController.update(id, { content });
      return res.status(200).json({ post });
    } catch (error) {
      return next(error);
    }
  })

  .delete(requireAuth, async (req, res, next) => {
    try {
      const { id } = req.params;
      const owner = await postController.remove(id);
      return res.status(200).json({ owner, message: getSuccessfulDeletionMessage(id) });
    } catch (error) {
      return next(error);
    }
  });

// Posts for a given user
router.route('/user/:uid')
  .get(async (req, res, next) => {
    try {
      const { uid } = req.params;
      const { posts, resultIds } = await postController.findUserPosts(uid);
      return res.status(200).json({ results: posts, resultIds, numResults: posts.length });
    } catch (error) {
      return next(error);
    }
  });

// Likes a post for a passed uid
router.route('/like/:id')
  .post(requireAuth, async (req, res, next) => {
    try {
      const { id } = req.params;
      const { uid } = req.body;
      const post = await postController.likePost(id, uid);
      return res.status(200).json({ post });
    } catch (error) {
      return next(error);
    }
  });

export default router;
