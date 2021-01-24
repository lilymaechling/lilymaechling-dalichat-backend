import { Router } from 'express';

const router = Router();

router.route('/')
  .get((req, res) => {
    res.status(200).json({ message: 'fetch all users' });
  });

router.route('/:id')
  .get((req, res) => {
    res.status(200).json({ message: 'get user with id' });
  })
  .put((req, res) => {
    res.status(200).json({ message: 'upated user with id' });
  })
  .delete((req, res) => {
    res.status(200).json({ message: 'delete user with id' });
  });

export default router;
