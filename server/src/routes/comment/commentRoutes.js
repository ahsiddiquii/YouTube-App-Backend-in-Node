import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { addComment } from "../../controllers/comment/addComment.controller.js";
import { getVideoComments } from "../../controllers/comment/getAllVideoComments.controller.js";
import { updateComment } from "../../controllers/comment/updateVideoComment.controller.js"
import { deleteComment } from "../../controllers/comment/deleteVideoComment.controller.js"

const commentRoutes = Router();

commentRoutes.use(verifyJWT)

commentRoutes.route("/:videoId").post(addComment).get(getVideoComments)
commentRoutes.route("/:commentId").patch(updateComment).delete(deleteComment)

export default commentRoutes;
