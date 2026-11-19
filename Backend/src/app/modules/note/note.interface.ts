import { Types } from "mongoose";

export interface INote {
  owner: Types.ObjectId;
  title: string;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}
