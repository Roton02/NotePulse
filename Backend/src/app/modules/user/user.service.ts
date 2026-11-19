import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import { buildMeta, getPagination } from "../../../shared/pagination";
import { IUser, UserRole } from "./user.interface";
import { User } from "./user.model";

const listUsers = async (query: { page?: unknown; limit?: unknown }) => {
  const { page, limit, skip } = getPagination(query);

  const [users, total] = await Promise.all([
    User.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(),
  ]);

  return { users, meta: buildMeta(page, limit, total) };
};

// Users grouped by interest, one group per interest, biggest groups first.
// Uses a single User.aggregate() call; the $facet stage returns the page and the total together.
const groupByInterests = async (query: { page?: unknown; limit?: unknown }) => {
  const { page, limit, skip } = getPagination(query);

  const [result] = await User.aggregate([
    { $unwind: "$interests" },
    {
      $group: {
        _id: "$interests",
        count: { $sum: 1 },
        users: { $push: { _id: "$_id", name: "$name", email: "$email" } },
      },
    },
    { $sort: { count: -1, _id: 1 } },
    {
      $facet: {
        groups: [
          { $skip: skip },
          { $limit: limit },
          { $project: { _id: 0, interest: "$_id", count: 1, users: 1 } },
        ],
        total: [{ $count: "count" }],
      },
    },
  ]);

  const total = result?.total[0]?.count ?? 0;
  return { groups: result?.groups ?? [], meta: buildMeta(page, limit, total) };
};

const createUser = async (payload: Partial<IUser>) => {
  return await User.create({
    name: payload.name,
    email: payload.email,
    password: payload.password,
    role: payload.role ?? UserRole.USER,
    interests: payload.interests ?? [],
  });
};

const getUserById = async (id: string) => {
  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  return user;
};

const updateUser = async (id: string, payload: Partial<IUser>, requesterId: string) => {
  // An admin cannot remove their own admin role, so the system always keeps an admin
  if (id === requesterId && payload.role && payload.role !== UserRole.ADMIN) {
    throw new ApiError(httpStatus.BAD_REQUEST, "You cannot change your own role");
  }

  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  if (payload.name !== undefined) user.name = payload.name;
  if (payload.email !== undefined) user.email = payload.email;
  if (payload.role !== undefined) user.role = payload.role;
  if (payload.interests !== undefined) user.interests = payload.interests;
  // Setting password marks it as modified, so the model hashes it on save
  if (payload.password !== undefined) user.password = payload.password;

  await user.save();
  return user;
};

const deleteUser = async (id: string, requesterId: string) => {
  if (id === requesterId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "You cannot delete your own account");
  }

  const user = await User.findByIdAndDelete(id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  return user;
};

export const userServices = {
  listUsers,
  groupByInterests,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
};
