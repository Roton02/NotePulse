import httpStatus from "http-status";
import config from "../../../config";
import ApiError from "../../../errors/ApiErrors";
import { jwtHelpers } from "../../../shared/jwtHelpers";
import { UserRole } from "../user/user.interface";
import { User } from "../user/user.model";
import { IAuthTokenPayload, ILoginPayload, IRegisterPayload } from "./auth.interface";

const createToken = (payload: IAuthTokenPayload) =>
  jwtHelpers.generateToken(payload, config.jwt.jwt_secret, config.jwt.expires_in);

const register = async (payload: IRegisterPayload) => {
  // Only the fields listed here are stored. New accounts always get the "user" role.
  const user = await User.create({
    name: payload.name,
    email: payload.email,
    password: payload.password,
    interests: payload.interests ?? [],
    role: UserRole.USER,
  });

  const token = createToken({ id: user.id, role: user.role });
  return { user, token };
};

const login = async (payload: ILoginPayload) => {
  const user = await User.findOne({ email: payload.email }).select("+password");

  // Same message for unknown email and wrong password, so accounts cannot be enumerated
  if (!user || !(await user.comparePassword(payload.password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }

  const token = createToken({ id: user.id, role: user.role });
  return { user, token };
};

const getMe = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  return user;
};

export const authServices = {
  register,
  login,
  getMe,
};
