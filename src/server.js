import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";

import constants from './constants';
import { postRouter, userRouter, searchRouter, authRouter } from "./routers";

const app = express();

// Enable json message body for posting data to router
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Enable / disable cross origin resource sharing if necessary
app.use(cors());

// Load config vars from ".env" files
dotenv.config();

// Enable / disable http request logging
app.use(morgan("dev"));

//routes
app.use('/posts', postRouter);
app.use('/users', userRouter);
app.use('/search', searchRouter);
app.use('/auth', authRouter);


app.get('/', (req, res) => {
    return res.status(200).json({ message: 'Welcome to the DALIChat backend!' });
});

// Custom 404 middleware
app.use((_req, res) => {
    res.status(404).json({ message: "The route you've requested doesn't exist" });
  });

// Initialize server
const port = process.env.PORT || constants; //changed from constants.DEFAULT_PORT
const server = app.listen(port);
console.log(`listening on: ${port}`);

export default server;