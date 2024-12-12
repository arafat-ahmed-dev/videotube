import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary, deleteCloudinaryImage } from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";

const createTweet = asyncHandler(async (req, res) => {
  // Destructure content from the request body
  const { content } = req.body;

  if (!content?.length) {
    throw new ApiError(404, "Tweet content not found");
  }

  // Get the local path of the uploaded tweet image
  const tweetImageLocalPath = req.file?.path;

  // Upload the tweet image to Cloudinary if provided
  let tweetImage;
  if (tweetImageLocalPath) {
    tweetImage = await uploadOnCloudinary(tweetImageLocalPath);
    if (!tweetImage) {
      throw new ApiError(500, "Failed to upload tweet image to Cloudinary");
    }
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
    .json(new ApiResponse(200, tweetWithOwner, "Tweet created successfully"));
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

const updateTweetContent = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;

  // Validate tweet ID
  if (!tweetId || !isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  // Find tweet and verify ownership
  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  // Verify tweet ownership
  if (tweet.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "Unauthorized to update this tweet");
  }

  // Validate content
  if (!content?.trim()) {
    throw new ApiError(400, "Tweet content is required");
  }

  // Update tweet content
  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: {
        content: content.trim()
      }
    },
    { new: true }
  ).populate("owner", "avatar fullName username");

  if (!updatedTweet) {
    throw new ApiError(500, "Something went wrong while updating tweet content");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedTweet, "Tweet content updated successfully"));
});

const updateTweetImage = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  // Validate tweet ID
  if (!tweetId || !isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  // Find tweet and verify ownership
  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  // Verify tweet ownership
  if (tweet.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "Unauthorized to update this tweet");
  }

  // Check if image is provided
  if (!req.file?.path) {
    throw new ApiError(400, "Tweet image is required");
  }

  // Upload new image
  const uploadedImage = await uploadOnCloudinary(req.file.path);
  if (!uploadedImage?.url) {
    throw new ApiError(500, "Error while uploading image");
  }

  // Update tweet image
  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: {
        tweetImage: uploadedImage.url
      }
    },
    { new: true }
  ).populate("owner", "avatar fullName username");

  if (!updatedTweet) {
    throw new ApiError(500, "Something went wrong while updating tweet image");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedTweet, "Tweet image updated successfully"));
});


const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  // Validate tweet ID
  if (!tweetId || !isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  // Find tweet and verify ownership
  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  // Verify tweet ownership
  if (tweet.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "Unauthorized to delete this tweet");
  }

  // Delete tweet image from Cloudinary if exists
  if (tweet.tweetImage) {
    // Extract public_id from Cloudinary URL
    const publicId = tweet.tweetImage.split('/').pop().split('.')[0];
    const cloudinaryResponse = await deleteCloudinaryImage(publicId);
    if (!cloudinaryResponse) {
      throw new ApiError(500, "Error while deleting tweet image");
    }
  }

  // Delete the tweet from database
  const deletedTweet = await Tweet.findByIdAndDelete(tweetId);
  if (!deletedTweet) {
    throw new ApiError(500, "Error while deleting tweet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Tweet deleted successfully"));
});

export { 
  createTweet, 
  getUserTweets,
  updateTweetContent,
  updateTweetImage,
  deleteTweet 
};
