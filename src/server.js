import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import mongoose from 'mongoose';

import {
  authRouter, userRouter, postRouter, searchRouter,
} from './routers';

import * as constants from './helpers/constants';

/**
 * TODO: Document API schema, endpoints, and best practices (inline endpoint documentation)
 * ? Look into mongoose model validation
 * ? Add liked posts array
 */

// Load config vars from ".env" files
require('dotenv').config();

// Initialize Express app
const app = express();

// Enable / disable cross origin resource sharing if necessary
app.use(cors());

// Enable / disable http request logging
app.use(morgan('dev'));

// Enable json message body for posting data to router
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Enable json message body for posting data to API
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Declare app routers
app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/posts', postRouter);
app.use('/search', searchRouter);

// Declare default route handler
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

// Configure MongoDB mongoose connection
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  loggerLevel: 'error',
};

// Connect to the database via mongoose
mongoose.connect(process.env.MONGODB_URI, mongooseOptions).then(() => {
  mongoose.Promise = global.Promise; // configures mongoose to use ES6 Promises
  console.info('Connected to Database');
}).catch((err) => {
  console.error('Not Connected to Database - ERROR! ', err);
});

// Set mongoose promise to JS promise
mongoose.Promise = global.Promise;

// Initialize server
const port = process.env.PORT || constants.PORT;
const server = app.listen(port);
console.log(`listening on: ${port}`);

export default server;
