import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import config from "../../config";
import { UserRole } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";

export const connectDB = async (): Promise<void> => {
  await mongoose.connect(config.mongo_uri);
  console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);
};

// Creates the super admin from env vars only if no admin user exists yet.
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

    const hashedPassword = await bcrypt.hash(password, config.bcrypt_salt_rounds);

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: UserRole.ADMIN,
    });

    console.log("🦸 Super admin created successfully");
  } catch (error) {
    console.error("Error seeding super admin:", error);
  }
};
