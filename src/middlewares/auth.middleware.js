import jwt from "jsonwebtoken";
import { ApiErrorHandle } from "../utils/ApiErrorHandle.js";
import { User } from "../models/users.models.js";
import { asyncHandler } from "../utils/asynchandler.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const accessToken =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!accessToken) {
      throw new ApiErrorHandle(400, "Unauthorized Request");
    }

    const decodedToken = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiErrorHandle(404, "Invalid Request");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiErrorHandle(400, error?.message || "Invalid Request");
  }
});
