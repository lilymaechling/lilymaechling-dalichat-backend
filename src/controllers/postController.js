import mongoose from 'mongoose';
import { Posts, Users } from '../models'; // TODO: Use user controller
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

  // TODO: Use user controller methods
  const owner = await Users.findOne({ _id: savedPost.owner });
  owner.posts.push(savedPost._id);

  const savedOwner = (await owner.save()).toJSON();
  delete savedOwner.password;

  return { post: savedPost, owner: savedOwner };
};

export const read = async (id) => {
  const foundPost = await Posts.findById(id);
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

  return foundPost.save();
};

export const remove = async (id) => {
  // Find and verify post
  const foundPost = await read(id);
  if (!foundPost) { throw new DocumentNotFoundError(id); }

  // Find and verify valid owner
  const owner = await Users.findOne({ _id: foundPost.owner });
  if (!owner) throw new DocumentNotFoundError(foundPost.owner, 'owner');

  // Remove pid from owner's "posts" array
  // TODO: Use user controller "update" functionality
  owner.posts = owner.posts.filter((pid) => { return pid !== new mongoose.Types.ObjectId(id); });
  const savedOwner = (await owner.save()).toJSON();

  await foundPost.remove();
  return savedOwner;
};

export const readAll = async () => {
  return Posts.find({});
};

export const findUserPosts = async (uid) => {
  // TODO: Interact with user controller
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
  const foundPost = await Posts.findOne({ _id: id });
  if (!foundPost) throw new DocumentNotFoundError(id);

  // Validate "uid" field
  // TODO: Use user controller here
  if (!uid) throw new IncompleteRequestError('uid');
  const foundUser = await Users.findById({ _id: uid });
  if (!foundUser) throw new DocumentNotFoundError(uid, 'owner');

  // Update post
  const unliking = foundPost.likes.some((l) => { return l.toString() === uid; });

  if (unliking) {
    foundPost.likes = foundPost.likes.filter((e) => { return e._id.toString() !== uid; });
  } else {
    foundPost.likes = foundPost.likes.slice();
    foundPost.likes.push(new mongoose.Types.ObjectId(uid));
  }

  // Save doc and populate
  const savedPost = await foundPost.save();
  const populatedPost = await Posts.populate(savedPost, { path: 'owner', select: '-password' });

  return populatedPost;
};
