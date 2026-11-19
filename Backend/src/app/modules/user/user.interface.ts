import { Model } from "mongoose";

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
}

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  interests: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export type UserModel = Model<IUser, {}, IUserMethods>;
