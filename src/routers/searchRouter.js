import { Router } from 'express';

const router = Router();

router.route('/posts')
  .get((req, res) => {
    res.status(200).json({ message: 'search for posts' });
  });

router.route('/users')
  .get((req, res) => {
    res.status(200).json({ message: 'search for users' });
  });

export default router;
