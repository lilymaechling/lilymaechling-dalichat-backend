import { Router } from 'express';

const router = Router();

router.route('/')
  .get((req, res) => {
    res.status(200).json({ message: 'gets posts' });
  })
  .post((req, res) => {
    res.status(200).json({ message: 'this is a post' });
  });

router.route('/:id')
  .get((req, res) => {
    res.status(200).json({ result: 'get posts with id' });
  })
  .put((req, res) => {
    res.status(200).json({ result: req.body.key1 });
  })
  .delete((req, res) => {
    res.status(200).json({ message: 'delete post with id' });
  });

router.route('/user/:uid')
  .get((req, res) => {
    const { uid } = req.params;
    res.status(200).json({ message: `fetchs posts of user with uid "${uid}` });
  });

router.route('/like/:id').post((req, res) => {
  const { id } = req.params;
  const { uid } = req.body;
  return res
    .status(200)
    .json({ message: `Likes post with id "${id}" for user with uid ${uid}` });
});

export default router;
