import { Router } from "express";
import { uploadVideo } from "../../controllers/video/uploadVideo.controller.js";
import { getAllVideos } from "../../controllers/video/getAllVideos.controller.js";
import { getVideoById } from "../../controllers/video/getVideoById.controller.js";
import { updateVideo } from "../../controllers/video/updateVideo.controller.js";
import { deleteVideo } from "../../controllers/video/deleteVideo.controller.js";
import { toggleVideoPublishStatus } from "../../controllers/video/toggleVideoPublishStatus.controller.js";
import { upload } from "../../middlewares/multer.middleware.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { getVideoByIdForGuest } from "../../controllers/video/getVideoByIdForGuest.js";


const videoRoutes = Router();

// videoRoutes.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

videoRoutes
    .route("/")
    .get(getAllVideos)
    .post(verifyJWT,
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1,
            },
            {
                name: "thumbnail",
                maxCount: 1,
            },
        ]),
        uploadVideo
    );
videoRoutes
    .route("/:videoId")
    .get(verifyJWT, getVideoById)
    .delete(verifyJWT, deleteVideo)
    .patch(verifyJWT, upload.single("thumbnail"), updateVideo);

videoRoutes.route("/toggle/publish/:videoId").patch(verifyJWT, toggleVideoPublishStatus);
videoRoutes.route("/guest/:videoId").get(getVideoByIdForGuest)

export default videoRoutes;
