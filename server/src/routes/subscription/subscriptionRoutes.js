import { Router } from "express";
import { getUserChannelSubscribers } from "../../controllers/subscription/getUserChannelSubscribers.controller.js"
import {toggleSubscription} from "../../controllers/subscription/toggleSubscription.controller.js"
import {getSubscribedChannels} from "../../controllers/subscription/getSubscribedChannels.controller.js"
import { verifyJWT } from "../../middlewares/auth.middleware.js"
import { removeSubscriber } from "../../controllers/subscription/removeSubscriber.controller.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
    .route("/channel/:channelId")
    .get(getSubscribedChannels)
    .post(toggleSubscription);

router.route("/user/:channelId").get(getUserChannelSubscribers);
router.route("/user/:channelId").post(removeSubscriber);

export default router
