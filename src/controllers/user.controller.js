import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
  uploadOnCloudinary,
  deleteCloudinaryImage,
} from "../utils/cloudinary.js";

const genarateAccessTokenAndRefreshToken = async (userid) => {
  try {
    const user = await User.findById(userid); // Retrieve user from DB
    const accessToken = await user.generateAccessToken(); // Generate Access Token
    const refreshToken = await user.generateRefreshToken(); // Generate Refresh Token

    user.refreshToken = refreshToken; // Save refresh token in user model
    await user.save({ validateBeforeSave: false }); // Save user without validation

    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    console.log("Error generating tokens: ", error); // Add logging here for debugging
    throw new apiError(
      500,
      "Something went wrong for generate Access token or Refresh token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // Get user details from request body
  const { username, email, fullName, password } = req.body;
  console.log("email", email);

  // Validate that all required fields are provided and not empty
  if (
    [username, email, fullName, password].some((field) => field?.trim() === "")
  ) {
    throw new apiError(400, "All fields are required");
  }

  // Check if user already exists with same username or email
  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    throw new apiError(400, "User already exists");
  }

  // Get local paths of uploaded files
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  // Validate avatar is provided since it's required
  if (!avatarLocalPath) {
    throw new apiError(400, "avatar image is required");
  }

  // Upload images to cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  // Verify avatar upload was successful
  if (!avatar) {
    throw new apiError(500, "Failed to upload avatar to cloudinary");
  }

  // Create new user in database
  const user = await User.create({
    username,
    email,
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "", // Use empty string if no cover image
    password,
  });

  // Fetch created user without sensitive fields
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // Verify user was created successfully
  if (!createdUser) {
    throw new apiError(500, "Something went wrong while registering the user");
  }

  // Return success response
  return res
    .status(200)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (email === undefined) {
    console.log("email is undefined");
  }

  if (!email) {
    throw new apiError(400, "email is required");
  }

  const user = await User.findOne({
    email: email.toLowerCase(),
  });
  if (!user) {
    throw new apiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new apiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } =
    await genarateAccessTokenAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const option = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken)
    .cookie("refreshToken", refreshToken, option)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const option = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", option)
    .clearCookie("refreshToken", option)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  // 1. Extract the refresh token from the request cookies or headers.
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  // 2. Check if the refresh token is provided; if not, throw an error.
  if (!incomingRefreshToken) {
    throw new apiError(401, "Unauthorized request");
  }

  try {
    // 3. Verify the refresh token using the secret stored in environment variables.
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.ACCESS_TOKEN_SECRET
    );

    // 4. Find the user associated with the token.
    const user = await User.findById(decodedToken?._id);

    // 5. If the user is not found, throw an error.
    if (!user) {
      throw new apiError(401, "Invalid refresh token");
    }

    // 6. Check if the incoming refresh token matches the user's stored refresh token.
    if (incomingRefreshToken !== user.refreshToken) {
      throw new apiError(401, "Refresh token is expired or used");
    }

    // 7. Generate a new access token and refresh token for the user.
    const { accessToken, newRefreshToken } =
      await genarateAccessTokenAndRefreshToken(user?._id);

    // 8. Set cookie options for security.
    const option = {
      httpOnly: true,
      secure: true,
    };

    // 9. Send the new access token and refresh token back to the client in the response.
    return res
      .status(200)
      .cookie("accessToken", accessToken)
      .cookie("refreshToken", newRefreshToken, option)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          "Access token refreshed"
        )
      );
  } catch (error) {
    // 10. Handle any errors that occur during the process.
    throw new apiError(401, error?.message || "Invalid refresh token");
  }
});

const currentPasswordChange = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const userId = req.user._id; // No need for await here, _id is not a promise
  const user = await User.findById(userId);

  if (!user) {
    throw new apiError(404, "User not found");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new apiError(400, "Invalid old password");
  }

  // Check if old password and new password are not the same
  if (await user.isPasswordCorrect(newPassword)) {
    throw new apiError(
      400,
      "New password cannot be the same as the old password"
    );
  }

  // Validate new password strength
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;

  if (!passwordRegex.test(newPassword)) {
    throw new apiError(
      400,
      "New password must be at least 10 characters long, contain a mix of uppercase and lowercase letters, a number, and a special character."
    );
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const userId = req.user._id; // Get the current user's ID from the request
  const user = await User.findById(userId); // Find the user in the database

  if (!user) {
    throw new apiError(404, "User not found"); // Handle case where user is not found
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Current user retrieved successfully")); // Respond with the current user's data
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, username } = req.body;
  const userId = req.user._id; // Get the current user's ID from the request

  // Check if username is being updated and if it already exists
  if (username) {
    const existingUser = await User.findOne({ username });
    if (existingUser && existingUser._id.toString() !== userId.toString()) {
      throw new apiError(400, "Username already exists. Try another one ");
    }
  }

  // Check if the new full name and username match the old ones
  const currentUser = await User.findById(userId);
  if (fullName === currentUser.fullName || username === currentUser.username) {
    throw new apiError(
      400,
      "New full name and username cannot be the same as the old ones"
    );
  }

  // Prepare the update object based on the fields provided
  const updateObject = {};
  if (fullName) updateObject.fullName = fullName;
  if (username) updateObject.username = username;

  // Save the updated user document in the database
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $set: updateObject,
    },
    {
      new: true,
    }
  );

  // Check for successful user update and handle any errors
  if (!updatedUser) {
    throw new apiError(500, "Something went wrong while updating the user");
  }

  // Return a success response with the updated user data
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "User account updated successfully")
    );
});

const updateAvatarFile = asyncHandler(async (req, res) => {
  const userId = req.user?._id; // Get the current user's ID from the request

  // Validate user existence
  const user = await User.findById(userId);
  if (!user) {
    throw new apiError(404, "User not found");
  }

  // Check if a new avatar image is provided in the request
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new apiError(400, "Avatar file is missing");
  }

  // Upload new avatar to Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar?.url) {
    throw new apiError(500, "Failed to upload avatar to Cloudinary");
  }

  // Delete old avatar from Cloudinary if it exists and is different
  const oldAvatarUrl = user.avatar;
  if (oldAvatarUrl && oldAvatarUrl !== avatar.url) {
    await deleteCloudinaryImage(oldAvatarUrl);
  }

  // Update user record with new avatar URL
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: { avatar: avatar.url } },
    { new: true }
  ).select("-password");

  if (!updatedUser) {
    throw new apiError(500, "Failed to update user with new avatar");
  }

  // Return success response with updated user data
  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Avatar updated successfully"));
});

const updateCoverImageFile = asyncHandler(async (req, res) => {
  const userId = req.user?._id; // Get the current user's ID from the request

  // Validate user existence
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Check if a new cover image is provided in the request
  const coverImageLocalPath = req.file?.path; // Assuming a single file upload
  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover image file is missing");
  }

  // Upload the new cover image to Cloudinary
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!coverImage?.url) {
    throw new ApiError(500, "Failed to upload cover image to Cloudinary");
  }

  // Store the old cover image URL
  const oldCoverImageUrl = user.coverImage;

  // Update the user with the new cover image URL in the database
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: { coverImage: coverImage.url } },
    { new: true }
  ).select("-password -refreshToken");

  if (!updatedUser) {
    throw new ApiError(
      500,
      "Something went wrong while updating the cover image"
    );
  }

  // Delete the old cover image if it exists and is different from the new one
  if (oldCoverImageUrl && oldCoverImageUrl !== coverImage.url) {
    await deleteCloudinaryImage(oldCoverImageUrl);
  }

  // Return a success response with the updated user data
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "Cover image updated successfully")
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  currentPasswordChange,
  getCurrentUser,
  updateAccountDetails,
  updateAvatarFile,
  updateCoverImageFile,
};
