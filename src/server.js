import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import mongoose from 'mongoose';

import {
  authRouter, userRouter, postRouter, searchRouter,
} from './routers';

/**
 * Need to complete:
 * TODO: Add password removal support for all fetched users
 * TODO: Follow this schema with all routers: https://mongoosejs.com/docs/documents.html#updating
 * TODO: Add post ownership on create
 * TODO: Add liked posts array
 * TODO: Find better way to handle removing sensitive information from response
 * TODO: Fix numPosts value setter
 * TODO: Update numPosts on post delete (in frontend)
 * TODO: Remove postid from user.posts on post delete
 *
 * TODO: Add global error handling for standard errors (with next() support)
 *
 * TODO: Document API schema, endpoints, and best practices (inline endpoint documentation)
 * ? Look into mongoose model validation
 */

import * as constants from './helpers/constants';

require('dotenv').config();

// initialize
const app = express();

// enable/disable cross origin resource sharing if necessary
app.use(cors());

// enable/disable http request logging
app.use(morgan('dev'));

// enable json message body for posting data to router
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// enable json message body for posting data to API
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// declare routers
app.use('/auth', authRouter); // NOTE: Not secured
app.use('/users', userRouter); // NOTE: Completely secured to users
app.use('/posts', postRouter); // NOTE: Partially secured to users
app.use('/search', searchRouter); // NOTE: Not secured

// default index route
app.get('/', (_req, res) => {
  res.send('Welcome to backend!');
});

// Custom 404 middleware
app.use((_req, res) => {
  res.status(404).json({ message: 'The route you\'ve requested doesn\'t exist' });
});

// Error handling middleware
app.use((error, _req, res, next) => {
  const { code = 500, message = 'Internal Server Error' } = error;
  if (res.headersSent) { next(error); }

  // Handle custom error behavior based on types here (e.g. DocumentNotFoundError)
  if (error instanceof mongoose.Error.CastError) {
    return res.status(400).json({ message: `Value ${error.stringValue} is not a valid ObjectId` });
  } else {
    return res.status(code).json({ message });
  }
});

// DB Setup
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  loggerLevel: 'error',
};

// Connect the database
mongoose.connect(process.env.MONGODB_URI, mongooseOptions).then(() => {
  mongoose.Promise = global.Promise; // configures mongoose to use ES6 Promises
  console.info('Connected to Database');
}).catch((err) => {
  console.error('Not Connected to Database - ERROR! ', err);
});

// Set mongoose promise to JS promise
mongoose.Promise = global.Promise;

// START THE SERVER
// =============================================================================
const server = app.listen(constants.PORT);
console.log(`listening on: ${constants.PORT}`);
export default server;
