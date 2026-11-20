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

// Public feed: all posts, newest first, paginated. Each post carries its author's id and name.
const getAllPosts = async (query: { page?: unknown; limit?: unknown }) => {
  const { page, limit, skip } = getPagination(query);

  const [posts, total] = await Promise.all([
    Post.aggregate([
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
      // Keep the post even if its author was deleted; the name then becomes null
      { $unwind: { path: "$author", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          title: 1,
          body: 1,
          createdAt: 1,
          updatedAt: 1,
          user: 1,
          author: { $ifNull: ["$author.name", null] },
        },
      },
    ]),
    Post.countDocuments(),
  ]);

  return { posts, meta: buildMeta(page, limit, total) };
};

// All posts of one user, newest first, paginated.
// One aggregation pipeline on the user: a single $lookup fetches the page of posts and the
// total count together, and adds the author's name to each post. An unknown user gives no rows.
const getPostsByUser = async (userId: string, query: { page?: unknown; limit?: unknown }) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid user ID");
  }

  const userObjectId = new Types.ObjectId(userId);
  const { page, limit, skip } = getPagination(query);

  const rows = await User.aggregate([
    { $match: { _id: userObjectId } },
    { $project: { name: 1 } },
    {
      $lookup: {
        from: "posts",
        let: { uid: "$_id", authorName: "$name" },
        pipeline: [
          { $match: { $expr: { $eq: ["$user", "$$uid"] } } },
          {
            $facet: {
              posts: [
                { $sort: { createdAt: -1 } },
                { $skip: skip },
                { $limit: limit },
                { $addFields: { author: "$$authorName" } },
                { $project: { title: 1, body: 1, createdAt: 1, updatedAt: 1, user: 1, author: 1 } },
              ],
              total: [{ $count: "count" }],
            },
          },
        ],
        as: "result",
      },
    },
    { $unwind: "$result" },
    {
      $project: {
        _id: 0,
        author: "$name",
        posts: "$result.posts",
        total: { $ifNull: [{ $arrayElemAt: ["$result.total.count", 0] }, 0] },
      },
    },
  ]);

  if (rows.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  return { posts: rows[0].posts, meta: buildMeta(page, limit, rows[0].total) };
};

export const postServices = {
  createPost,
  getAllPosts,
  getPostsByUser,
};
