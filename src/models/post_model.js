import mongoose, { Schema } from 'mongoose';

const ResourceSchema = new Schema({
  title: { type: Schema.Types.String, default: '' },
  content: { type: Schema.Types.String, default: '' },
  likes: { type: Schema.Types.Number, default: 0 },
  postDate: { type: Schema.Types.Date, default: Date.now() }, // default JSON date format for JS: https://stackoverflow.com/a/15952652/10256611,
});

const ResourceModel = mongoose.model('Post', ResourceSchema);

export default ResourceModel;
