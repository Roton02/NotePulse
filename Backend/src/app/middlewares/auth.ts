import { NextFunction, Request, Response } from "express";
import config from "../../config";
import { Secret } from "jsonwebtoken";
import httpStatus from "http-status";
import { jwtHelpers } from "../../shared/jwtHelpers";
import ApiError from "../../errors/ApiErrors";

// Verifies the "Authorization: Bearer <token>" header and, when roles are given,
// checks that the token's role is one of them.
const auth = (...roles: string[]) => {
  return async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ) => {
    try {
      const [scheme, token] = (req.headers.authorization || "").split(" ");

      if (scheme !== "Bearer" || !token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized!");
      }

      let verifiedUser;
      try {
        verifiedUser = jwtHelpers.verifyToken(token, config.jwt.jwt_secret as Secret);
      } catch {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Token is invalid or expired! Please login again.");
      }

      req.user = verifiedUser;

      if (roles.length && !roles.includes(verifiedUser.role)) {
        throw new ApiError(httpStatus.FORBIDDEN, "Forbidden! You are not authorized");
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

export default auth;
