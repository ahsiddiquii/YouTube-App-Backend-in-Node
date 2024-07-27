import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { toggleVideoLike } from "../../controllers/like/toggleVideoLike.controller.js";
import { toggleCommentLike } from "../../controllers/like/toggleCommentLike.controller.js";
import { toggleTweetLike } from "../../controllers/like/toggleTweetLike.controller.js";
import { getUserLikedVideos } from "../../controllers/like/getLikedVideos.controller.js";

const likeRoutes = Router();
likeRoutes.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

likeRoutes.route("/video/:videoId").post(toggleVideoLike);
likeRoutes.route("/comment/:commentId").post(toggleCommentLike);
likeRoutes.route("/tweet/:tweetId").post(toggleTweetLike);
likeRoutes.route("/user/likedVideos").get(getUserLikedVideos);

export default likeRoutes;
