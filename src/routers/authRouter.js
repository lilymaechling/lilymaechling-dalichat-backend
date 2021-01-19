import express from 'express';

const router = express();

router.route('/signup')
  .post((req, res) => {
    return res.status(200).json({ message: 'Sign up user' });
  });

router.route('/signin')
  .post((req, res, next) => {
    return res.status(200).json({ message: 'Sign in user' });
  });

router.route('/validate')
  .post((req, res) => {
    return res.status(200).json({ message: 'Validate user object' });
  });

export default router;
