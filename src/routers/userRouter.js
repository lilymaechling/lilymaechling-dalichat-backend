import express from 'express';

const router = express();

router.route('/')
  .get((req, res) => {
    return res.status(200).json({ message: 'Fetch all users' });
  });

// * User creation handled by authRouter's "/signin" route

router.route('/:id')
  .get((req, res) => {
    const { id } = req.params;
    return res.status(200).json({ message: `Fetch user with id "${id}"` });
  })

  .put((req, res) => {
    const { id } = req.params;
    return res.status(200).json({ message: `Update user with id "${id}"` });
  })

  .delete((req, res) => {
    const { id } = req.params;
    return res.status(200).json({ message: `Remove user with id "${id}"` });
  });

export default router;
