import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env"), quiet: true });

const requiredEnv = ["MONGO_URI", "JWT_SECRET"];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnv.join(", ")}`);
}

if ((process.env.JWT_SECRET as string).length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters long");
}

export default {
  env: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  mongo_uri: process.env.MONGO_URI as string,
  bcrypt_salt_rounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 12,
  cors_origins: (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  super_admin: {
    name: process.env.SUPER_ADMIN_NAME || "Super Admin",
    email: process.env.SUPER_ADMIN_EMAIL,
    password: process.env.SUPER_ADMIN_PASSWORD,
  },
  jwt: {
    jwt_secret: process.env.JWT_SECRET as string,
    expires_in: process.env.JWT_EXPIRES_IN || "1d",
  },
};
