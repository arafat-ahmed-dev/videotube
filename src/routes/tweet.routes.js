import { Router } from "express";
import {
    createTweet,
    getUserTweets,
    updateTweetContent,
    updateTweetImage,
    deleteTweet
} from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.use(verifyJWT); // Apply authentication to all routes

router.route("/")
    .post(
        upload.single("tweetImage"), // Handle image upload
        createTweet
    )
    .get(getUserTweets);

router.route("/:tweetId/content")
    .patch(updateTweetContent);

router.route("/:tweetId/image")
    .patch(
        upload.single("tweetImage"),
        updateTweetImage
    );

router.route("/:tweetId")
    .delete(deleteTweet);

export default router;
