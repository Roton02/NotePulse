import { model, Schema } from "mongoose";
import { IPost } from "./post.interface";

const postSchema = new Schema<IPost>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: 200,
    },
    body: {
      type: String,
      required: [true, "Body is required"],
      maxlength: 5000,
    },
  },
  { timestamps: true }
);

// A user's posts, newest first. Serves the $match and $sort of the user-posts aggregation.
postSchema.index({ user: 1, createdAt: -1 });

export const Post = model<IPost>("Post", postSchema);
