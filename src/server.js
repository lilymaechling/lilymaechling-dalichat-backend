import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import mongoose from 'mongoose';

import {
  authRouter, userRouter, resourceRouter, searchRouter,
} from './routers';

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
app.use('/resources', resourceRouter); // NOTE: Partially secured to users
app.use('/search', searchRouter); // NOTE: Not secured

// default index route
app.get('/', (req, res) => {
  res.send('Welcome to backend!');
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

// Custom 404 middleware
app.use((req, res) => {
  res.status(404).json({ message: 'The route you\'ve requested doesn\'t exist' });
});

// Set mongoose promise to JS promise
mongoose.Promise = global.Promise;

// START THE SERVER
// =============================================================================
const server = app.listen(constants.PORT);
console.log(`listening on: ${constants.PORT}`);
export default server;
