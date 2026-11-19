# NotePulse Backend

Secure note-taking REST API built with TypeScript, Express 4, MongoDB and Mongoose. The project layout follows the modular pattern used in the lendmora backend.

## Project structure

```
Backend/
├── src/
│   ├── app/
│   │   ├── DB/            # MongoDB connection
│   │   ├── middlewares/   # global error handler, request validation
│   │   ├── modules/       # feature modules (added step by step)
│   │   └── routes/        # route registry, mounted under /api/v1
│   ├── config/            # env loading and validation
│   ├── errors/            # ApiError and error mappers (Zod, Mongoose)
│   ├── interfaces/        # shared types
│   ├── shared/            # catchAsync, sendResponse
│   ├── app.ts             # Express app setup
│   └── server.ts          # entry point
├── .env.example
├── package.json
└── tsconfig.json
```

Each feature module will follow the same layout as lendmora, for example `modules/auth/` with `auth.routes.ts`, `auth.controller.ts`, `auth.service.ts` and `auth.validation.ts`.

## Getting started

Requirements: Node.js 18+ and a MongoDB instance (local or Atlas).

```bash
cd Backend
npm install
cp .env.example .env     # then set MONGO_URI and JWT_SECRET
npm run dev             # development, restarts on change
```

Production:

```bash
npm run build
npm start
```

## Environment variables

| Variable             | Required | Default       | Description                                       |
| -------------------- | -------- | ------------- | ------------------------------------------------- |
| `MONGO_URI`          | yes      | —             | MongoDB connection string                         |
| `JWT_SECRET`         | yes      | —             | Signing secret, at least 32 characters            |
| `PORT`               | no       | `5000`        | HTTP port                                         |
| `NODE_ENV`           | no       | `development` | Environment name                                  |
| `JWT_EXPIRES_IN`     | no       | `1d`          | Token lifetime                                    |
| `BCRYPT_SALT_ROUNDS` | no       | `12`          | bcrypt cost factor                                |
| `CORS_ORIGINS`       | no       | empty         | Comma-separated allowed origins; empty blocks CORS |

The server refuses to start if `MONGO_URI` or `JWT_SECRET` is missing, or if `JWT_SECRET` is shorter than 32 characters.

## Current endpoints

| Method | Path          | Description        |
| ------ | ------------- | ------------------ |
| GET    | `/health`     | Liveness check     |

API routes are mounted under `/api/v1`. Feature endpoints will be documented here as each module is added.

## Error response format

```json
{
  "success": false,
  "message": "Validation error",
  "errorMessages": [{ "path": "title", "message": "Title is required" }]
}
```
