/* eslint-disable func-names */
import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';

const UserSchema = new Schema({
  email: { type: Schema.Types.String, required: true, unique: true },
  username: { type: Schema.Types.String, required: true, unique: true },
  password: { type: Schema.Types.String, required: true },
  firstName: { type: Schema.Types.String, required: true },
  lastName: { type: Schema.Types.String, required: true },

  isAdmin: { type: Schema.Types.Boolean, default: false },
  isVerified: { type: Schema.Types.Boolean, default: false },

  profileUrl: { type: Schema.Types.String, default: '' },
  backgroundUrl: { type: Schema.Types.String, default: '' },
  portfolioUrl: { type: Schema.Types.String, default: '' },
  blurb: { type: Schema.Types.String, default: '' },

  posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
  numPosts: { type: Schema.Types.Number },

  accountCreated: { type: Schema.Types.Date, default: Date.now() },
}, {
  toObject: {
    virtuals: true,
  },
  toJSON: {
    virtuals: true,
  },
});

const saltRounds = 10;

// Add a preprocessing function to the user's save function to hash password before saving
UserSchema.pre('save', function (next) {
  // Check if password needs to be rehashed
  if (this.isNew || this.isModified('password')) {
    const document = this; // Save reference to current scope

    // Hash and save document password
    bcrypt.hash(document.password, saltRounds, (error, hashedPassword) => {
      if (error) {
        next(error);
      } else {
        document.password = hashedPassword;
        next();
      }
    });
  } else {
    next();
  }
});

/**
 * Updates numPosts on "posts" field update
 * * Virtuals are only resolved after a query, so if results
 * * are being sliced any length-based virtuals will be inaccurate
 */
UserSchema.post('validate', function (_doc, next) {
  if (this.isNew || this.isModified('posts')) {
    const document = this; // Saves scope if callbacks are needed
    document.numPosts = document.posts.length;
  }
  next();
});

// Add a method to the user model to compare passwords
// Boolean "same" returns whether or not the passwords match to callback function
UserSchema.methods.comparePassword = function (password, done) {
  bcrypt.compare(password, this.password, (error, same) => {
    if (error) {
      done(error);
    } else {
      done(error, same);
    }
  });
};

UserSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

const UserModel = mongoose.model('User', UserSchema);

export default UserModel;
