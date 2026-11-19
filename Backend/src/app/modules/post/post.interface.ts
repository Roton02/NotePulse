import { Types } from "mongoose";

export interface IPost {
  user: Types.ObjectId;
  title: string;
  body: string;
  createdAt?: Date;
  updatedAt?: Date;
}
