# DALIChat Backend

## Features

### Authentication

- Login flow
- Sign up flow

### Posts

- View personal posts
- Creating / editing / deleting posts

### Search

- Search page
- View curated posts
- Notifications / Inbox (chat?)

### Users

- Following users
- View / edit personal profile
- View other profiles

## Models

### Post

#### Post Fields

- content
- likes
- postDate
- owner

#### Post Virtuals

No virtuals

### User

#### User Fields

- email*
- password*
- username*
- password*
- firstname*
- lastName*

- profile url
- isAdmin
- isVerified
- background url

- posts

#### User Virtuals

fullName

## Routers

- Authentication
- Post
- Search
- User
