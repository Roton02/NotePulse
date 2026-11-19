import httpStatus from "http-status";
import { Types } from "mongoose";
import ApiError from "../../../errors/ApiErrors";
import { buildMeta, getPagination } from "../../../shared/pagination";
import { User } from "../user/user.model";
import { IPost } from "./post.interface";
import { Post } from "./post.model";

const createPost = async (authorId: string, payload: Partial<IPost>) => {
  return await Post.create({
    user: new Types.ObjectId(authorId),
    title: payload.title,
    body: payload.body,
  });
};

// All posts of one user, newest first, paginated.
// One aggregation pipeline with a $lookup stage adds the author's name to each post.
const getPostsByUser = async (userId: string, query: { page?: unknown; limit?: unknown }) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid user ID");
  }

  const userObjectId = new Types.ObjectId(userId);
  const userExists = await User.exists({ _id: userObjectId });
  if (!userExists) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const { page, limit, skip } = getPagination(query);

  const [posts, total] = await Promise.all([
    Post.aggregate([
      { $match: { user: userObjectId } },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          let: { authorId: "$user" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$authorId"] } } },
            { $project: { _id: 0, name: 1 } },
          ],
          as: "author",
        },
      },
      { $unwind: "$author" },
      {
        $project: {
          _id: 1,
          title: 1,
          body: 1,
          createdAt: 1,
          updatedAt: 1,
          author: "$author.name",
        },
      },
    ]),
    Post.countDocuments({ user: userObjectId }),
  ]);

  return { posts, meta: buildMeta(page, limit, total) };
};

export const postServices = {
  createPost,
  getPostsByUser,
};
