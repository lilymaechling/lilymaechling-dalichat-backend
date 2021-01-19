import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
// import mongoose from 'mongoose';

import { postRouter } from './routers';

import * as constants from './utils/constants';

// Load config vars from ".env" files
dotenv.config();

// Initialize Express app
const app = express();

// Enable / disable cross origin resource sharing if necessary
app.use(cors());

// Enable / disable http request logging
app.use(morgan('dev'));

// Enable json message body for posting data to router
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// // Declare app routers
// app.use('/auth', authRouter);
// app.use('/users', userRouter);
app.use('/posts', postRouter);
// app.use('/search', searchRouter);

// Declare default route handler
app.get('/', (_req, res) => {
  return res.status(200).json({ message: 'Welcome to the DALIChat backend!' });
});

// Custom 404 middleware
app.use((_req, res) => {
  res.status(404).json({ message: 'The route you\'ve requested doesn\'t exist' });
});

// Initialize server
const port = process.env.PORT || constants.DEFAULT_PORT;
const server = app.listen(port);
console.log(`listening on: ${port}`);

export default server;
