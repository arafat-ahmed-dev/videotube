import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";

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
  const avatorLocalPath = req.files?.avator[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  // Validate avator is provided since it's required
  if (!avatorLocalPath) {
    throw new apiError(400, "avator image is required");
  }

  // Upload images to cloudinary
  const avator = await uploadonCloudinary(avatorLocalPath);
  const coverImage = await uploadonCloudinary(coverImageLocalPath);

  // Verify avator upload was successful
  if (!avator) {
    throw new apiError(500, "Failed to upload avator to cloudinary");
  }

  // Create new user in database
  const user = await User.create({
    username,
    email,
    fullName,
    avator: avator.url,
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
  const { email, username, password } = req.body;

  console.log("Email provided: ", email);
  console.log("username found: ", username);

  if (!username || !email) {
    throw new apiError(400, "username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
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
    .clearcookie("accessToken", option)
    .clearcookiecookie("refreshToken", option)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

export { registerUser, loginUser, logoutUser };
