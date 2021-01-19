import express from 'express';

const router = express();

router.route('/posts')
  .get((req, res) => {
    return res.status(200).json({ message: 'Search for posts' });
  });

router.route('/users')
  .get((req, res) => {
    return res.status(200).json({ message: 'Search for users' });
  });

export default router;
