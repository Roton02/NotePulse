import { model, Schema } from "mongoose";
import { IUser, UserRole } from "./user.interface";

const userSchema = new Schema<IUser>(
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
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });

userSchema.set("toJSON", {
  transform: (_doc, ret: any) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

export const User = model<IUser>("User", userSchema);
