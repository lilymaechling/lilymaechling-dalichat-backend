import { Router } from 'express';

const router = Router();

router.route('/signup').post((req, res) => {
  return res
    .status(200)
    .json({ message: 'sign up a new user' });
});

router.route('/signin').post((req, res) => {
  return res
    .status(200)
    .json({ message: 'sign in a user' });
});

router.route('/validate').post((req, res) => {
  return res
    .status(200)
    .json({ message: 'return information about a user' });
});

export default router;
