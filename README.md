# NotePulse

NotePulse is a note taking app with a REST API and a web frontend. Users keep private notes and publish public posts. Admins manage users and can see every note.

## Features

1. Sign up and log in with a token
2. Passwords are hashed and never returned by the API
3. Private notes you can create read update and delete
4. Public posts with a feed that loads more as you scroll
5. Pick your interests from a fixed list when you sign up
6. Every list is paginated and shows 10 items per page
7. Admin panel with a sidebar for users and all notes and interest groups
8. Admins can create edit and delete users

## Project structure

```
Care_Guide/
  Backend/     REST API (Express, TypeScript, MongoDB)
  Frontend/    Web app (Next.js, TypeScript, axios)
```

Inside the backend:

```
Backend/
  src/app/modules/   auth, user, note and post features
  src/app/           middlewares, routes and database setup
  src/config/        settings loaded from .env
  src/errors/        error helpers
  src/shared/        shared helpers
```

Inside the frontend:

```
Frontend/
  app/          pages and global styles
  components/   screens and shared pieces
  lib/          API client and types
```

## What you need

1. Node.js 18 or newer
2. A MongoDB database (MongoDB Atlas works well)
3. npm (installed together with Node.js)

## Run the backend

1. Open a terminal in the Backend folder and install the packages.

```bash
cd Backend
npm install
```

2. Copy the example settings file.

```bash
cp .env.example .env
```

3. Open the new `.env` file and fill in the values described below.
4. Start the server.

```bash
npm run dev
```

The API runs on http://localhost:5000. When it starts you should see the message MongoDB connected in the terminal.

## Settings in .env

1. `MONGO_URI` is your MongoDB connection string.
2. `JWT_SECRET` is a long random text of at least 32 characters.
3. `SUPER_ADMIN_EMAIL` and `SUPER_ADMIN_PASSWORD` create the first admin when the server starts. The admin is created only if no admin exists yet.
4. `PORT` is optional and defaults to 5000.
5. `CORS_ORIGINS` can stay empty when you use the Next.js frontend.

## Run the frontend

1. Open a second terminal in the Frontend folder and install the packages.

```bash
cd Frontend
npm install
```

2. Start the web app.

```bash
npm run dev
```

3. Open http://localhost:3000 in your browser.

By default the frontend uses the hosted backend at https://note-pulse-three.vercel.app. To use a local backend set the `BACKEND_URL` variable to http://localhost:5000 before you start the frontend.

## First login

1. Open the app and log in with the email and password from `SUPER_ADMIN_EMAIL` and `SUPER_ADMIN_PASSWORD`.
2. Admins also see an Admin tab with the sidebar sections.
3. Everyone else can register. The register form lets you pick interests from the list.

## Roles

1. User: manages their own notes and posts and reads the public feed.
2. Admin: does everything a user can do and also manages users and sees all notes.

## Test the API with Postman

1. Import the collection file and the environment file from the Backend folder into Postman.
2. Open the NotePulse Local environment and fill in `adminEmail` and `adminPassword`.
3. Run the collection with the Collection Runner.

The run creates real records in your database. Use a test database if you can.

## API overview

```
Health
  GET    /health

Auth
  POST   /api/v1/auth/register
  POST   /api/v1/auth/login
  GET    /api/v1/auth/me
  GET    /api/v1/auth/interests

Notes (logged in)
  POST   /api/v1/notes
  GET    /api/v1/notes
  GET    /api/v1/notes/:id
  PATCH  /api/v1/notes/:id
  DELETE /api/v1/notes/:id
  GET    /api/v1/notes/all            admin only

Posts
  GET    /api/v1/posts                public feed
  POST   /api/v1/posts                logged in
  GET    /api/v1/posts/user/:userId   public

Users (admin only)
  GET    /api/v1/users
  POST   /api/v1/users
  GET    /api/v1/users/interests
  GET    /api/v1/users/:id
  PATCH  /api/v1/users/:id
  DELETE /api/v1/users/:id
```

List endpoints accept `?page=1&limit=10`. The limit can be at most 50.

## Useful commands

Backend:

```bash
npm run dev      starts the server with auto restart
npm run build    compiles the code into the dist folder
npm start        runs the compiled server
```

Frontend:

```bash
npm run dev      starts the development server
npm run build    makes a production build
npm start        runs the production build
```

To create a new backend feature module:

```bash
node module.js moduleName
```

## Troubleshooting

1. If the server says a required variable is missing then check `MONGO_URI` and `JWT_SECRET` in the .env file.
2. If the server says `JWT_SECRET` is too short then use a longer value.
3. If you see `EADDRINUSE` then port 5000 is already in use. Stop the other backend terminal or change `PORT`.
4. If the frontend shows network errors then make sure the backend is running on port 5000.
5. If admin login fails then check the `SUPER_ADMIN` values and look for the message Super admin created in the first start log.

## Tech stack

1. Backend: Node.js and Express 4 with TypeScript and MongoDB through Mongoose
   Login uses JWT and passwords use bcryptjs and input checks use Zod
2. Frontend: Next.js with React and TypeScript and axios for API calls

More detail is in the Backend README. It has the full API reference and explains roles and indexes.
