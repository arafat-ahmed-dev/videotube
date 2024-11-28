import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"; // Ensure this is correct
import { User } from "../models/user.model.js";
import { apiError } from "../utils/apiError.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    // Check for token in cookies or Authorization header
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new apiError(401, "Unauthorized request");
    }

    // Decode the token using the secret key
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Find the user associated with the decoded token
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new apiError(401, "Invalid Access Token");
    }

    req.user = user; // Attach user to the request object
    next(); // Continue to the next middleware
  } catch (error) {
    // Handle error if token is invalid or expired
    throw new apiError(401, error?.message || "Invalid access token");
  }
});

