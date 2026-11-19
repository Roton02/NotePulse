# NotePulse Backend

A secure note-taking REST API with a small plain frontend. Built with TypeScript, Express 4, MongoDB and Mongoose.

## Features

- JWT login with bcrypt password hashing (passwords are hashed on save)
- Two roles: `user` and `admin`, enforced by middleware
- Users manage their own notes and posts; admins manage users and see all notes
- Pagination on every list endpoint (`page`, `limit`, max 50)
- Two aggregation pipelines: users grouped by interest, and a user's posts with a `$lookup`
- Plain HTML/CSS/JS frontend in `public/` (no templates)

## Setup

Requirements: Node.js 18+ and a MongoDB instance (local or Atlas).

```bash
cd Backend
npm install
cp .env.example .env     # set MONGO_URI, JWT_SECRET and the SUPER_ADMIN_* values
npm run dev              # development (restarts on change)
```

Open `http://localhost:5000` for the frontend. The API is under `/api/v1`.

Production:

```bash
npm run build
npm start
```

### Environment variables

| Variable             | Required | Default       | Description                                        |
| -------------------- | -------- | ------------- | -------------------------------------------------- |
| `MONGO_URI`          | yes      | —             | MongoDB connection string                          |
| `JWT_SECRET`         | yes      | —             | Signing secret, at least 32 characters             |
| `PORT`               | no       | `5000`        | HTTP port                                          |
| `NODE_ENV`           | no       | `development` | `production` hides internal error details          |
| `JWT_EXPIRES_IN`     | no       | `1d`          | Token lifetime                                     |
| `BCRYPT_SALT_ROUNDS` | no       | `12`          | bcrypt cost factor                                 |
| `CORS_ORIGINS`       | no       | empty         | Comma-separated allowed origins; empty blocks CORS |
| `SUPER_ADMIN_NAME`   | no       | `Super Admin` | Name of the seeded admin                           |
| `SUPER_ADMIN_EMAIL`  | no       | —             | Seeded admin email (seed is skipped if unset)      |
| `SUPER_ADMIN_PASSWORD` | no     | —             | Seeded admin password, at least 8 characters       |

On startup, a super admin is created from the `SUPER_ADMIN_*` values, but only when no admin exists yet.

## Roles

| Capability                                   | user | admin |
| -------------------------------------------- | :--: | :---: |
| Register, log in, view own profile           |  ✓   |   ✓   |
| Create, list, view, update, delete own notes |  ✓   |   ✓   |
| Create and read posts                        |  ✓   |   ✓   |
| View any single note                         |      |   ✓   |
| List all notes (paginated)                   |      |   ✓   |
| List, create, update, delete users           |      |   ✓   |
| View users grouped by interest               |      |   ✓   |

- New accounts always get the `user` role. The role cannot be set at registration.
- An admin cannot change their own role or delete their own account.
- Anyone who isn't the owner gets `404` for a note, so note IDs can't be probed.

## Pagination

Every list endpoint accepts `page` (default 1) and `limit` (default 10, max 50), and returns:

```json
"meta": { "page": 1, "limit": 10, "total": 23 }
```

## Endpoints

Send the token as `Authorization: Bearer <token>`.

### Health

| Method | Path      | Auth | Description      |
| ------ | --------- | ---- | ---------------- |
| GET    | `/health` | no   | Liveness check   |

### Auth (`/api/v1/auth`)

| Method | Path        | Auth | Body                                              |
| ------ | ----------- | ---- | ------------------------------------------------- |
| POST   | `/register` | no   | `{ name, email, password, interests? }`           |
| POST   | `/login`    | no   | `{ email, password }`                             |
| GET    | `/me`       | yes  | —                                                 |

`register` and `login` return `{ user, token }`. Both are rate limited to 20 requests per 15 minutes per IP.

### Notes (`/api/v1/notes`)

| Method | Path     | Auth        | Description                                  |
| ------ | -------- | ----------- | -------------------------------------------- |
| POST   | `/`      | user, admin | Create a note `{ title, content? }`          |
| GET    | `/`      | user, admin | List your own notes (paginated)              |
| GET    | `/all`   | admin       | List all notes with owner info (paginated)   |
| GET    | `/:id`   | owner or admin | Get one note                              |
| PATCH  | `/:id`   | owner       | Update `title` and/or `content`              |
| DELETE | `/:id`   | owner       | Delete a note                                |

### Posts (`/api/v1/posts`)

Posts are visible to everyone.

| Method | Path             | Auth | Description                                         |
| ------ | ---------------- | ---- | --------------------------------------------------- |
| POST   | `/`              | yes  | Create a post `{ title, body }`                     |
| GET    | `/user/:userId`  | no   | All posts by one user, newest first (paginated)     |

### Users (`/api/v1/users`, admin only)

| Method | Path          | Description                                              |
| ------ | ------------- | -------------------------------------------------------- |
| GET    | `/`           | List users (paginated, newest first)                     |
| POST   | `/`           | Create a user `{ name, email, password, role?, interests? }` |
| GET    | `/interests`  | Users grouped by interest, biggest groups first (paginated) |
| GET    | `/:id`        | Get one user                                             |
| PATCH  | `/:id`        | Update `name`, `email`, `password`, `role` or `interests` |
| DELETE | `/:id`        | Delete a user                                            |

Passwords are never returned in responses.

## Aggregations

**Users grouped by interest** (`GET /users/interests`): one `User.aggregate()` call that unwinds `interests`, groups by interest, sorts by count, and uses `$facet` to return the requested page and the total together. Each group lists its users.

**A user's posts** (`GET /posts/user/:userId`): one aggregation pipeline that matches the user's posts, sorts newest first, pages with `$skip`/`$limit`, and uses a `$lookup` stage to add the author's name. The total comes from a separate count.

## Indexes

All indexes are defined with `schema.index`. There are five, and each one supports a specific query:

| Collection | Index                   | Used by                                  |
| ---------- | ----------------------- | ---------------------------------------- |
| users      | `{ email: 1 }` unique   | login lookup and duplicate-email check   |
| users      | `{ createdAt: -1 }`     | admin user list, newest first            |
| notes      | `{ owner: 1, createdAt: -1 }` | a user's own notes, newest first   |
| notes      | `{ createdAt: -1 }`     | admin list of all notes, newest first    |
| posts      | `{ user: 1, createdAt: -1 }`  | a user's posts (`$match` and `$sort`) |

Lookups by `_id` (single note, single user) use MongoDB's built-in `_id` index. The interest grouping scans the whole users collection with no filter, so no extra index would help it, and none was added.

## Frontend

`public/` holds a plain HTML/CSS/JS page served by the API. It covers:

- Register and log in (the token is kept in `localStorage` for this browser only)
- My notes: create, edit, delete, paginate
- Posts: publish, and view any user's posts by ID
- Admin panel (admin accounts only): manage users, list all notes, and view users grouped by interest

## Errors

```json
{
  "success": false,
  "message": "Validation Error",
  "errorMessages": [{ "path": "title", "message": "Title is required" }]
}
```

| Code | Meaning                                              |
| ---- | ---------------------------------------------------- |
| 400  | Validation failed or malformed request               |
| 401  | Missing, invalid or expired token; wrong login       |
| 403  | Logged in, but the role isn't allowed                |
| 404  | Route, note or user not found                        |
| 409  | Duplicate value (for example, an email already used) |
| 429  | Too many auth attempts                               |

## Generating a module

`module.js` creates a new Mongoose module (model, service, controller, validation, routes):

```bash
node module.js <moduleName>
```

Then register its routes in `src/app/routes/index.ts`.
