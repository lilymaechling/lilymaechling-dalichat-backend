import mongoose from 'mongoose';

import { Posts } from '../models';
import * as userController from './userController';

import { DocumentNotFoundError, IncompleteRequestError } from '../errors';

/**
 * Creates a new post and saves it to the database
 *
 * @async
 * @param {*} param0 required fields to create a post
 * @returns {Promise<object>} resolves created post object
 * @throws {DocumentNotFoundError} throws if no user document exists with id of uid
 * @throws {IncompleteRequestError} throws if required fields aren't included
 */
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

/**
 * Finds post object with passed id
 *
 * @async
 * @param {mongoose.Types.ObjectId | string} id id of document to read from
 * @returns {Promise<object>} post with passed id
 * @throws {DocumentNotFoundError} throws if no document exists with passed id
 */
export const read = async (id) => {
  const foundPost = await Posts
    .findById(id)
    .populate({ path: 'owner', select: '-password' });
  if (!foundPost) { throw new DocumentNotFoundError(id); }
  return foundPost;
};

/**
 * Updates the selected document and saves the updated document to the database
 *
 * @async
 * @param {mongoose.Types.ObjectId | string} id id of document to update
 * @param {object} fields updates to make to the document (key:value pairs)
 * @returns {Promise<object>} post with passed id with updated fields
 * @throws {DocumentNotFoundError} throws if no document exists with passed id
 */
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

/**
 * Deletes post based on passed id
 *
 * @async
 * @param {mongoose.Types.ObjectId | string} id id of post to delete
 * @returns {Promise<object>} owner object of found post
 * @throws {DocumentNotFoundError} throws if no document exists with passed id
 */
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

/**
 * Returns all documents in "Posts" collection
 *
 * @async
 * @returns {Promise<object[]>} resolves array of all posts in posts collection
 */
export const readAll = async () => {
  return Posts
    .find({})
    .populate({ path: 'owner', select: '-password' });
};

/**
 * Finds limited subset of posts of a given user
 *
 * @async
 * @param {mongoose.Types.ObjectId | string} uid id of user to find posts for
 * @returns {Promise<object[]>} resolves found user posts
 * @throws {DocumentNotFoundError} throws if no user document exists with id of uid
 */
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

/**
 * Adds uid to post's "likes" array and returns updated post object
 *
 * @async
 * @param {mongoose.Types.ObjectId | string} id id of post to like
 * @param {mongoose.Types.ObjectId | string} uid id of owner of post
 * @returns {Promise<object>} resolves updated post object
 * @throws {DocumentNotFoundError} throws if documents corresponding to id or uid not found
 * @throws {IncompleteRequestError} throws if uid missing from request
 */
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
