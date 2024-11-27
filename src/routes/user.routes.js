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
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/reset-password").post(verifyJWT, currentPasswordChange);
router.route("/update-account").post(verifyJWT, updateAccountDetails);
router
  .route("/avatar")
  .post(verifyJWT, upload.single("avatar"), updateAvatarFile);
router
  .route("/cover-image")
  .post(verifyJWT, upload.single("coverImage"), updateCoverImageFile);

export default router;
