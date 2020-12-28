import mongoose from 'mongoose';

import { Posts } from '../models';
import * as userController from './userController';

import { DocumentNotFoundError, IncompleteRequestError } from '../errors';

export const create = async ({ content, uid }) => {
  if (!content) throw new IncompleteRequestError('content');
  if (!uid) throw new IncompleteRequestError('uid');

  // Create new post document and add fields
  const post = new Posts();
  post.content = content;
  post.likes = [];
  post.numLikes = 0;
  post.postDate = Date.now();
  post.owner = uid;

  const savedPost = await post.save();

  // Find and validate owner (notFound handled in userController)
  const owner = await userController.read(savedPost.owner);

  // Update owner's "posts" array with new post id
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

  // Can't save and populate with one "await" call
  const savedPost = await foundPost.save();
  return savedPost.populate({ path: 'owner', select: '-password' });
};

export const remove = async (id) => {
  // Find and verify post
  const foundPost = await read(id);
  if (!foundPost) { throw new DocumentNotFoundError(id); }

  // Find and verify valid owner (notFound handled in userController)
  const owner = await userController.read(foundPost.owner);

  // Remove pid from owner's "posts" array
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
  const posts = await Posts
    .find({ owner: uid })
    .sort({ postDate: -1 })
    .limit(5)
    .populate({
      path: 'owner',
      select: '-password',
    });

  const resultIds = posts.map((r) => { return r._id; });
  return { posts, resultIds };
};

export const likePost = async (id, uid) => {
  const foundPost = await read(id);
  if (!foundPost) throw new DocumentNotFoundError(id);

  // Validate "uid" field
  if (!uid) throw new IncompleteRequestError('uid');
  await userController.read(uid);

  // Is the user liking or unliking the post?
  const unliking = foundPost.likes.some((l) => { return l.toString() === uid; });

  // Update post "likes" array
  let updatedLikesArr = foundPost.likes.slice();

  if (unliking) {
    updatedLikesArr = updatedLikesArr.filter((e) => { return e._id.toString() !== uid; });
  } else {
    updatedLikesArr.push(new mongoose.Types.ObjectId(uid));
  }

  // Save updated likes array to post and return saved post object
  return update(foundPost._id, { likes: updatedLikesArr });
};
