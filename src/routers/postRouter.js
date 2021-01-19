import express from 'express';

const router = express();

router.route('/')
  .get((req, res) => {
    return res.status(200).json({ message: 'Fetch all posts' });
  })

  .post((req, res) => {
    return res.status(200).json({ message: 'Create post' });
  });

router.route('/:id')
  .get((req, res) => {
    const { id } = req.params;
    return res.status(200).json({ message: `Fetch post with id "${id}"` });
  })

  .put((req, res) => {
    const { id } = req.params;
    return res.status(200).json({ message: `Update post with id "${id}"` });
  })

  .delete((req, res) => {
    const { id } = req.params;
    return res.status(200).json({ message: `Remove post with id "${id}"` });
  });

router.route('/user/:uid')
  .get((req, res) => {
    const { uid } = req.params;
    return res.status(200).json({ message: `Fetch all posts for user with uid "${uid}"` });
  });

router.route('/like/:id')
  .post((req, res) => {
    const { id } = req.params;
    const { uid } = req.body;
    return res.status(200).json({ message: `Likes post with id "${id}" for user with uid ${uid}` });
  });

export default router;
