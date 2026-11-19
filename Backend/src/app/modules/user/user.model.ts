import bcrypt from "bcryptjs";
import { model, Schema } from "mongoose";
import config from "../../../config";
import { IUser, IUserMethods, UserModel, UserRole } from "./user.interface";

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    // Hidden by default; query with .select("+password") when it is needed
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    interests: {
      type: [{ type: String, trim: true, lowercase: true, maxlength: 30 }],
      default: [],
      validate: {
        validator: (interests: string[]) => interests.length <= 20,
        message: "A user can have at most 20 interests",
      },
    },
  },
  { timestamps: true }
);

// Login lookup and uniqueness of accounts. This is the only index the user model needs.
userSchema.index({ email: 1 }, { unique: true });

// Admin user list, newest first (paginated)
userSchema.index({ createdAt: -1 });

// Hash the password whenever it is set or changed, so it is never stored in plain text
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  this.password = await bcrypt.hash(this.password, config.bcrypt_salt_rounds);
});

userSchema.methods.comparePassword = async function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.set("toJSON", {
  transform: (_doc, ret: any) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

export const User = model<IUser, UserModel>("User", userSchema);
