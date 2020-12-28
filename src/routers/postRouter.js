// @ts-check
import express from 'express';

import { postController } from '../controllers';

import { requireAuth } from '../authentication';
import { getSuccessfulDeletionMessage } from '../helpers/constants';

const router = express();

// find and return all resources
router.route('/')
  .get(requireAuth, async (_req, res, next) => {
    try {
      const posts = await postController.readAll();
      return res.status(200).json({ posts });
    } catch (error) {
      return next(error);
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

      // * Limits the fields a user request can update while allowing the controller to update any valid field
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
      const results = await postController.findUserPosts(uid);
      const resultIds = results.map((r) => { return r._id; });
      return res.status(200).json({ results, resultIds, numResults: results.length });
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
