import mongoose, { Schema } from 'mongoose';

const ResourceSchema = new Schema({
  content: { type: Schema.Types.String, default: '' },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  numLikes: { type: Schema.Types.Number, default: 0 },
  postDate: { type: Schema.Types.Date, default: Date.now() }, // default JSON date format for JS: https://stackoverflow.com/a/15952652/10256611,
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
});

ResourceSchema.post('validate', function (_doc, next) {
  if (this.isNew || this.isModified('likes')) {
    const document = this;
    document.numLikes = document.likes.length;
  }
  next();
});

const PostModel = mongoose.model('Post', ResourceSchema);

export default PostModel;
