import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import mongoose from 'mongoose';

import constants from './constants';
import {
  postRouter, userRouter, searchRouter, authRouter,
} from './routers';

const app = express();

// Enable json message body for posting data to router
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Enable / disable cross origin resource sharing if necessary
app.use(cors());

// Load config vars from ".env" files
dotenv.config();

// enable mongoose
// Configure MongoDB mongoose connection
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  loggerLevel: 'error',
};

// Connect to the database via mongoose
mongoose
  .connect(process.env.MONGODB_URI, mongooseOptions)
  .then(() => {
    mongoose.Promise = global.Promise; // configures mongoose to use ES6 Promises
    console.info('Connected to Database');
  })
  .catch((err) => {
    console.error('Not Connected to Database - ERROR! ', err);
  });

// Set mongoose promise to JS promise
mongoose.Promise = global.Promise;

// Enable / disable http request logging
app.use(morgan('dev'));

// routes
app.use('/posts', postRouter);
app.use('/users', userRouter);
app.use('/search', searchRouter);
app.use('/auth', authRouter);

app.get('/', (req, res) => {
  return res.status(200).json({ message: 'Welcome to the DALIChat backend!' });
});

// Custom 404 middleware
app.use((_req, res) => {
  res.status(404).json({ message: 'The route you\'ve requested doesn\'t exist' });
});

// Error handling middleware
app.use((error, _req, res, next) => {
  const { code = 500, message = 'Internal Server Error' } = error;
  if (res.headersSent) {
    next(error);
  }

  // Handle custom error behavior based on types here (e.g. DocumentNotFoundError)
  if (error instanceof mongoose.Error.CastError) {
    return res
      .status(400)
      .json({ message: `Value ${error.stringValue} is not a valid ObjectId` });
  } else {
    return res.status(code).json({ message });
  }
});

// Initialize server
const port = process.env.PORT || constants; // changed from constants.DEFAULT_PORT
const server = app.listen(port);
console.log(`listening on: ${port}`);

export default server;
