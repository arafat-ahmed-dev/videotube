import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError, ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const createTweet = asyncHandler(async (req, res) => {
  // Destructure content from the request body
  const { content } = req.body;

  if (!content?.length) {
    throw new ApiError(404, "Tweet content not found");
  }

  // Get the local path of the uploaded tweet image
  const tweetImageLocalPath = req.file?.path;

  // Upload the tweet image to Cloudinary
  const tweetImage = await uploadOnCloudinary(tweetImageLocalPath); // Use await here since uploadOnCloudinary might return a promise
  if (!tweetImage) {
    throw new ApiError(500, "Failed to upload tweet image to Cloudinary");
  }

  // Find the user by ID
  const createdUser = await User.findById(req.user?._id);
  if (!createdUser) {
    throw new ApiError(404, "User not found");
  }

  // Create the tweet document
  const tweet = await Tweet.create({
    content,
    tweetImage: tweetImage?.url || "", // Ensure valid tweetImage URL
    owner: createdUser._id, // Reference to the created user
  });

  // Verify that the tweet was created successfully
  if (!tweet) {
    throw new ApiError(500, "Something went wrong while creating the tweet");
  }

  // Populate the tweet with owner details
  const tweetWithOwner = await Tweet.findById(tweet._id).populate(
    "owner",
    "avatar fullName username"
  );

  // Return the populated tweet as a response
  return res
    .status(200)
    .json(new ApiResponse(200 , tweetWithOwner ,"Tweet created successfully"));
});


const getUserTweets = asyncHandler(async (req, res) => {
  const userId = req?.user._id;

  // Check if userId is provided
  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  // Fetch all tweets of the user with populated owner details
  const userTweets = await Tweet.find({ owner: userId })
    .populate("owner", "avatar fullName username") // Populate owner fields (avatar, full name, username)
    .sort({ createdAt: -1 }); // Sort by created date, latest first

  // If no tweets found for the user
  if (!userTweets.length) {
    throw new ApiError(404, "No tweets found for this user");
  }

  // Return the fetched tweets as a response
  return res
    .status(200)
    .json(
      new ApiResponse(200, userTweets, "User's tweets fetched successfully")
    );
});


const updateTweet = asyncHandler(async (req, res) => {
  
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
