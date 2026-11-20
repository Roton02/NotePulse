import mongoose from "mongoose";
import config from "../../config";
import { UserRole } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";

// Opens the database connection once and reuses it. Safe to call many times.
// Serverless hosts (Vercel) may run the app without server.ts, so requests also call this.
let connecting: Promise<typeof mongoose> | null = null;

export const connectDB = async (): Promise<void> => {
  if (mongoose.connection.readyState === 1) return;
  if (!connecting) {
    connecting = mongoose
      .connect(config.mongo_uri, { serverSelectionTimeoutMS: 8000 })
      .then((conn) => {
        console.log(`✅ MongoDB connected: ${conn.connection.host}`);
        return conn;
      })
      .catch((err) => {
        connecting = null; // allow a retry on the next request
        throw err;
      });
  }
  await connecting;
};

// Creates the super admin from env vars only if no admin user exists yet.
// The User model hashes the password on save, so the raw password is passed here.
export const seedSuperAdmin = async (): Promise<void> => {
  const { name, email, password } = config.super_admin;

  if (!email || !password) {
    console.warn("⚠️  SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD not set, skipping super admin seed");
    return;
  }

  if (password.length < 8) {
    console.warn("⚠️  SUPER_ADMIN_PASSWORD must be at least 8 characters, skipping super admin seed");
    return;
  }

  try {
    const adminExists = await User.exists({ role: UserRole.ADMIN });
    if (adminExists) {
      return;
    }

    await User.create({ name, email, password, role: UserRole.ADMIN });

    console.log("🦸 Super admin created successfully");
  } catch (error) {
    console.error("Error seeding super admin:", error);
  }
};
