import mongoose from 'mongoose';

import { Posts } from '../models';
import * as userController from './userController';

import { DocumentNotFoundError, IncompleteRequestError } from '../errors';

export const create = async ({ content, uid }) => {
  if (!content) throw new IncompleteRequestError('content');
  if (!uid) throw new IncompleteRequestError('uid');

  const post = new Posts();
  post.content = content;
  post.likes = [];
  post.numLikes = 0;
  post.postDate = Date.now();
  post.owner = uid;

  const savedPost = await post.save();

  const owner = await userController.read(savedPost.owner);

  const updatedPostsArr = owner.posts.slice();
  updatedPostsArr.push(savedPost._id);
  const savedOwner = await userController.update(owner._id, { posts: updatedPostsArr });

  return { post: savedPost, owner: savedOwner };
};

export const read = async (id) => {
  const foundPost = await Posts
    .findById(id)
    .populate({ path: 'owner', select: '-password' });
  if (!foundPost) { throw new DocumentNotFoundError(id); }
  return foundPost;
};

export const update = async (id, fields) => {
  const { content, likes, numLikes } = fields;

  const foundPost = await read(id);
  if (!foundPost) { throw new DocumentNotFoundError(id); }

  if (content) foundPost.content = content;
  if (likes) foundPost.likes = likes;
  if (numLikes) foundPost.numLikes = numLikes;

  const savedPost = await foundPost.save();
  return savedPost.populate({ path: 'owner', select: '-password' });
};

export const remove = async (id) => {
  const foundPost = await read(id);
  if (!foundPost) { throw new DocumentNotFoundError(id); }

  const owner = await userController.read(foundPost.owner);

  let updatedPostsArr = owner.posts.slice();
  updatedPostsArr = updatedPostsArr.filter((pid) => { return pid.toString() !== id; });
  const savedOwner = await userController.update(owner._id, { posts: updatedPostsArr });

  await foundPost.remove();
  return savedOwner;
};

export const readAll = async () => {
  return Posts
    .find({})
    .populate({ path: 'owner', select: '-password' });
};

export const findUserPosts = async (uid) => {
  const owner = await userController.read(uid);
  const posts = await Posts
    .find({ _id: { $in: owner.posts } })
    .sort({ postDate: -1 })
    .limit(5)
    .populate({
      path: 'owner',
      select: '-password',
    });

  return posts;
};

export const likePost = async (id, uid) => {
  const foundPost = await read(id);
  if (!foundPost) throw new DocumentNotFoundError(id);

  if (!uid) throw new IncompleteRequestError('uid');
  await userController.read(uid);

  const unliking = foundPost.likes.some((l) => { return l.toString() === uid; });

  let updatedLikesArr = foundPost.likes.slice();

  if (unliking) {
    updatedLikesArr = updatedLikesArr.filter((e) => { return e._id.toString() !== uid; });
  } else {
    updatedLikesArr.push(new mongoose.Types.ObjectId(uid));
  }

  return update(foundPost._id, { likes: updatedLikesArr });
};
