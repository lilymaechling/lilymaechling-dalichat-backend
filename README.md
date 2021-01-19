# Day 5 - Backend Basics

This repository was designed and developed by Adam McQuilkin '22, and is intended to teach new DALI lab members the basics of MERN-stack Javascript web development as well as current best practices. To suggest changes to this repository, please create an issue here or create a pull request here.

## Overview

Welcome to the world of backend development! The backend is the core of any web application, and is the supporting layer that allows the frontend to complete irts required tasks. That being said, it is vital that you design your backend intuitively and robustly to give your application a strong, functional base.

## Core Concepts

Before we jump into implementing the backend for DALIChat, we first need to review some core backend concepts. As a reminder, we will be implementing the DALIChat backend with the [ExpressJS framework](https://expressjs.com/). This is a very popular server framework written in Javascript for running on a NodeJS backend engine.

### CRUD Basics

As we discussed in lecture today, CRUD is an acronym representing the basic functionality required of many web applications: Create, Read, Update, Delete. For example, in DALIChat we will need to be able to Create posts, Read posts, Update posts, and Delete posts, and to do this the server must implement these routes.

Implementing CRUD functionality requires a connection to a database (next class!), so for now we will simply set up the framework to allow us to plug the database into our server. We will be using helper functions to do this, but keep in mind that each of these helper functions represents a database call in a fully functional server.

Each CRUD operation requires a different HTTP request type, as listed below:

- Create - HTTP `POST` request
- Read - HTTP `GET` request
- Update - HTTP `PUT` request
- Delete - HTTP `DELETE` request

To specify which resource we want to modify with a given HTTP request we will be using a URL route parameter (e.g. `SERVER/posts/POST_ID`). This is normally all the information you need in a `GET` and `DELETE` request, but for `POST` and `PUT` requests we will be specifying additional information in the request body. As a reminder, URL parameters can be accessed in the `req.params` object, and the request body can be accessed with the `req.body` object.

### Router Basics

With the basics of CRUD out of the way, we can move on to the details of how to implement these operations within a functional ExpressJS server. To start, it's helpful to remember that in a production server there will be many different types of resources on which we will need to perform CRUD operations (`post` and `user` resources for DALIChat), and as such placing all of these endpoints in one location wouldn't be scalable.

> To clarify, an endpoint is the point of communication between a server and client. An endpoint is defined by a route (e.g. `/posts`) and an HTTP method (e.g. `PATCH`).

Instead, what we do is create `router` files which allow us to compartmentalize our logic for different parts of the server. When breaking down server logic into different files, it is helpful to consider the different requirements of the server and break down the application from there. For example, in the DALIChat application we will have the following routers:

1. Post Router - Post model CRUD operations
2. User Router - User model CRUD operations
3. Search Router - Post and User searching
4. Auth Router - User authentication handler

As a note, it would be equally valid to move the functionality of the search router into the post and user routers, but we chose to place this functionality in its own router due to how similar the code is for searching the post and user models.

## Tasks

Below are the tasks to complete before next class.

### Set up `server.js` File

Before we can work on implementing the server functionality, we must first create the server file itself and initialize the ExpressJS framework. To start, create a `server.js` file at the root of your `src` directory. This will be the file that runs the server itself and which will eventually be deployed to a hosting service. The server we will be creating will require the functionality of the following packages:

- `body-parser` - Allows access to `req.body` variable ([link](https://www.npmjs.com/package/body-parser))
- `cors` - Handles [CORS requests](https://developer.mozilla.org/en-US/docs/Glossary/CORS) ([link](https://www.npmjs.com/package/cors))
- `dotenv` - Imports `.env` files into `process.env` ([link](https://www.npmjs.com/package/dotenv))
- `express` - ExpressJS framework ([link](https://www.npmjs.com/package/express))
- `morgan` - Logs server requests to console ([link](https://www.npmjs.com/package/morgan))

For the most part you don't have to worry about the functionality of these packages, although we do have to configure them for our server to function. To do this, run the following command in the root of your backend directory:

```bash
yarn install
```

Then, add the following imports to your `src/server.js` file:

```javascript
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
```

Then, we will declare a new express application that will contain the logic for out server. To do this, include the following code:

```javascript
// Initialize Express app
const app = express();
```

We can now attach [middleware](https://expressjs.com/en/guide/using-middleware.html) to the application as we discussed above using the `app.use()` function. We will now attach the required middleware to our application.

To configure the `body-parser` package, add the following code below the previous code:

```javascript
// Enable json message body for posting data to router
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
```

This code tells the express server to parse the body of all incoming requests into a `req.body` variable we can then access.

To configure the `cors` package, add the following code below the previous code:

```javascript
// Enable / disable cross origin resource sharing if necessary
app.use(cors());
```

This code currently does not significantly modify the functionality of the server, but if your API will be called from a different [origin](https://developer.mozilla.org/en-US/docs/Glossary/origin) you need to configure this to make the API callable from your frontend code. This is due to a vital browser security protocol known as the [Same Origin Policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy) that is important to be familiar with.

To configure the `dotenv` package, add the following code below the previous code:

```javascript
// Load config vars from ".env" files
dotenv.config();
```

This configures the server to include any variables from a `/.env` file into [NodeJS' builtin](https://nodejs.org/api/process.html#process_process_env) `process.env` variable.

To configure the `morgan` package, add the following code below the previous code:

```javascript
// Enable / disable http request logging
app.use(morgan("dev"));
```

This will tell the server to log information about every incoming request, including the request type, request subroute, response code, and response time. We are currently running it in the `dev` mode.

Next, add the following lines of code to the bottom of the file:

```javascript
// Custom 404 middleware
app.use((_req, res) => {
  res.status(404).json({ message: "The route you've requested doesn't exist" });
});
```

This code will handle any routes we don't, and as such we will be sending the message `'The route you\'ve requested doesn\'t exist'`. The server's routers will eventually be placed above this line, and since express runs through `use`d middleware in order of addition, this will handle any routes we don't explicitly declare in our routers.

Finally, add the following code to the bottom of the file:

```javascript
// Initialize server
const port = process.env.PORT || constants.DEFAULT_PORT;
const server = app.listen(port);
console.log(`listening on: ${port}`);

export default server;
```

This code will start the server and exports it in the event we need to import it from another higher-level config file. Before this code is functional, we need to create a `/.env` file and add the following line to it:

```text
PORT=9090
```

Additionally, create a `src/utils/constants.js` file and add the following code:

```javascript
export const DEFAULT_PORT = 9090;
```

Now, you will be able to run the server! Run `yarn dev` to see the server boot up, and open `localhost:9090` in your browser to see the output of the server.

### Plan out Server Routes

#### Welcome Message

When you run the application, you should see the default 404 response that you just added. This is because we haven't told the server what routes to accept and what to respond with on each of those endpoints. Before we get into the more complicated endpoints, let's create a simple endpoint that handles the server's root url (`/`).

To create an endpoint within express, we will be using the `app.METHOD` function, where `METHOD` is the name of the HTTP method we want to accept. In this case, we want to make a welcome message to the API on the root of the server, and to make this viewable in a browser we need to use the `GET` method.

The `app.get()` method takes two parameters:

1. The url to accept (relative to the server's root)
2. A handler callback function

This callback function accepts two parameters that we will cover today: `req` and `res`. The `req` parameter contains data about the incoming request and the `res` parameter allows you to specify information about the outgoing server response. To start, first declare the following endpoint **above** the `404` middleware we declared previously:

```javascript
app.get();
```

Then, specify that we want the root of the server as below:

```javascript
app.get("/");
```

Then, declare an inline arrow function with `req` and `res` parameters:

```javascript
app.get('/', (req, res) => {

}));
```

Now that we have declared the endpoint, we need to tell express what to do once the server routes a request to this endpoint. In this case, we want to return an object with a `message` field when the user requests the `/` route. To do this, we will append data to the `res` response object and then send it back to the requesting entity (the browser in this case). We do this with the `res.json()` function call. There is also a `res.send()` function which is more limited but with a similar API. We recommend recommend using `res.json()` over `res.send()` due to `res.send()` being more limited than `res.json()`.

To send JSON back from this endpoint, we can pass an object into the `res.json()` call and this object will be sent back to the entity which requested the given endpoint. In our case, we will pass in an object with a `message` field:

Below is how to call this function:

```javascript
app.get('/', (req, res) => {
  return res.json({ message: 'Welcome to the DALIChat backend!' });
}));
```

> It is best practice to `return` the `res.json()` call, since returning tells the endpoint that you should complete the processing of the helper function. This is convenient since you cannot further edit the `res` object after calling `res.json()` or `res.send()`. The one exception to this is if you need to do some additional processing after the request completes, in which case you would simply call `res.json()` and then run this additional processing. As a note, we have found that this use case is exceedingly rare in DALI projects.

Now that we have clarified the data we want to send back from the endpoint, we now need to set the status of the response coming out from the server. As a reminder, `200` signifies a valid request and in our case this is what we will always be returning. We do this with the `res.status()` function call.

> As a note, `res.status()` defaults to returning a `200` status code. This being said, we highly recommend that you still write `res.status(200)` as a means of being explicit within your code. This makes your endpoint code more consistent and reduces status code errors when you may forget to include a non-`200` status code.

We will implement this as shown below:

```javascript
app.get('/', (req, res) => {
  return res.status(200).json({ message: 'Welcome to the DALIChat backend!' });
}));
```

You will now be able to view this message in your browser when navigating to `localhost:9090`!

#### Routers

Now that we've created a simple endpoint, we can move on to implementing more of the logic of the application. To prepare us for this implementation, we must first think about the following:

1. What functionality will we need?
2. What routers will we create to implement this functionality?
3. What endpoints will each of these routers contain?
4. How will each of these endpoints behave?

In terms of endpoint behavior, we must think about two things:

1. What data will the endpoint return?
2. What status codes will the endpoint return, and for what behavior?

The data question is more subjective to each application, but status codes are fairly consistent, especially for a CRUD application router. Read through a list of which status codes each type of CRUD endpoint (type in full caps) should implement ([link](https://github.com/dali-lab/crud-template-backend/blob/master/src/routers/README.md)). If you need a refresher on what each of these status codes signifies, see [this link](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status).

For our CRUD routers, you will be implementing the following endpoints from the above document:

- `FETCH ONE`
- `CREATE ONE`
- `UPDATE ONE`
- `DELETE ONE`

- `FETCH MULTIPLE` (fetch all)

As such, you will be expected to account for each of the specified status codes in your final server. We will not be directly implementing these status codes (other than `200`) today.

### Implement Server Routes

Now that we have a plan for the routers we will need and how their respective endpoints will behave, we can begin actually creating our endpoints. First, create the following files in the `src/routers` directory:

- `authRouter.js`
- `searchRouter.js`
- `index.js`
- `postRouter.js`
- `userRouter.js`

We will start by implementing the `postRouter.js` file. We will first need to import the `express` package. Then we will create a new router with the following code:

```javascript
const router = express();

export default router;
```

Note that this is declared identically to the main server. We are creating a subapplication within the main server express application which will handle the `/posts` route.

To connect the router to the main server application, first add the following code in the `index.js` file:

```javascript
import postRouter from "./postRouter";

export { postRouter };
```

Then, import the post router from this file as below in your `server.js` file:

```javascript
import { postRouter } from "./routers";
```

We will then import the router as middleware with the `app.use()` call **above** the root url handler we created earlier:

```javascript
app.use("/posts", postRouter);
```

Here we are telling the main server application to send any requests on the `/posts` subroute to the postRouter, which will then either handle the route or send the request to the default `404` handler we created earlier.

Back in the `postRouter.js` file, we now need to configure the router to return dummy data since we haven't yet connected the server to a database. Now that we have a router instance configured, we can tell the server how to handle each endpoint in this router. To start, we will break the router into subroutes as follows:

```javascript
router.route("/");
router.route("/:id");
```

This tells the server that we want to be able to handle the root of this router (`/posts/`) as well as a subroute with a passed `id` parameter. The `:id` syntax tells express to expect an `id` parameter to be passed into the route (e.g. `/posts/idone`) and to load this string into the `req.params.id` variable. We can then access this variable within a given endpoint. We will need the following endpoints on the following subroutes:

```text
/
  GET - fetch all objects in DB
  POST - create new object

/:id
  GET - fetch object by id
  PUT - update object by id
  DELETE - remove object by id
```

We can create these routes by adding routes to the above `router.route()` calls:

```javascript
router.route("/").get().post();
```

Note that we can chain request types onto the `router.route()` calls. This is what allows us to handle multiple HTTP methods for a single subroute.

Now that you know the basics of routing in express, it's time to implement the skeleton of the DALIChat backend. Below is a list of routers we will need, subroutes we will need within those routers, and which HTTP methods each subroute will need to implement.

```text
postRouter (/posts)
  /
    GET - fetch all posts
    POST - create new post

  /:id
    GET - fetch post by id
    PUT - update post by id
    DELETE - remove post by id

  /user/:uid
    GET - fetch posts of user with given uid

  /like/:id
    POST - like post with given id with uid passed in req.body

userRouter (/users)
  /
    GET - fetch all users

  /:id
    GET - fetch user by id
    PUT - update user by id
    DELETE - remove user by id

searchRouter (/search)
  /posts
    GET - search for posts (no params)

  /users
    GET - search for users (no params)

authRouter (/auth)
  /signup
    POST - sign up a new user

  /signin
    POST - sign in an existing user

  /validate
    POST - return information about a user
```

For each of the given endpoints, return an object with a `message` field giving useful information about the endpoint. For example, given the `/like/:id` endpoint:

```javascript
router.route("/like/:id").post((req, res) => {
  const { id } = req.params;
  const { uid } = req.body;
  return res
    .status(200)
    .json({ message: `Likes post with id "${id}" for user with uid ${uid}` });
});
```

You will then need to connect each router file to the main server application as we discussed above. As always, if you ever need any help feel free to reach out to us at any time. Good luck!

## Readings

Below are readings to complete before the next class.

### Asynchronous Javascript

- [Using Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)
- [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [Async / Await](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Async_await)

### Misc Readings

- [Connect Middleware Basics](https://github.com/senchalabs/connect) (this is the base library for the express middleware handler)
