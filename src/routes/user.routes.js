import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  currentPasswordChange,
  updateAccountDetails,
  updateAvatarFile,
  updateCoverImageFile,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// User Registration
router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

// User Login
router.route("/login").post(loginUser);

// User Logout
router.route("/logout").post(verifyJWT, logoutUser);

// Token Refresh
router.route("/refresh-token").post(refreshAccessToken);

// Password Change
router.route("/password-change").post(verifyJWT, currentPasswordChange);

// Update Account Details
router.route("/update-account").patch(verifyJWT, updateAccountDetails);

// Update Avatar
router
  .route("/avatar")
  .patch(verifyJWT, upload.single("avatar"), updateAvatarFile);

// Update Cover Image
router
  .route("/cover-image")
  .patch(verifyJWT, upload.single("coverImage"), updateCoverImageFile);

// Get Current User
router.route("/current-user").get(verifyJWT, getCurrentUser);

// Get User Channel Profile
router.route("/c/:username").get(verifyJWT, getUserChannelProfile);

// Get Watch History
router.route("/history").get(verifyJWT, getWatchHistory);

export default router;
