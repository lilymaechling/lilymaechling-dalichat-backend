/* eslint-disable func-names */
import mongoose, { Schema } from 'mongoose';

const ResourceSchema = new Schema({
  content: { type: Schema.Types.String, default: '' },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  numLikes: { type: Schema.Types.Number, default: 0 },
  postDate: { type: Schema.Types.Date, default: Date.now() }, // default JSON date format for JS: https://stackoverflow.com/a/15952652/10256611,
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
});

/**
 * Updates numLikes on "likes" field update
 * * Virtuals are only resolved after a query, so if results
 * * are being sliced any length virtuals will be inaccurate
 */
ResourceSchema.pre('update', function (next) {
  if (this.isNew || this.isModified('likes')) {
    const document = this;
    document.numLikes = document.likes.length;
  }
  next();
});

const ResourceModel = mongoose.model('Post', ResourceSchema);

export default ResourceModel;
