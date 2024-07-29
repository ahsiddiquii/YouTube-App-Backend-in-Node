import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes
import router from "./routes/users/userRoutes.js";
import videoRoutes from "./routes/video/videoRoutes.js";
import tweetRoutes from "./routes/tweet/tweetRoutes.js";
import subscriptionRoutes from "./routes/subscription/subscriptionRoutes.js";
import playlistRoutes from "./routes/playlist/playlistRoutes.js";
import likeRoutes from "./routes/like/likeRoutes.js";
import commentRoutes from "./routes/comment/commentRoutes.js";

// ROUTES DECLARATION:
// http://localhost:4000/api/v1/

// User Routes 
app.use("/api/v1/users", router)
// Video Routes 
app.use("/api/v1/video", videoRoutes)
// Tweet Routes 
app.use("/api/v1/tweet", tweetRoutes)
// Subscription Routes 
app.use("/api/v1/subcription", subscriptionRoutes)
// Playlist Routes 
app.use("/api/v1/playlist", playlistRoutes)
// Like Routes 
app.use("/api/v1/like", likeRoutes)
// Comment Routes 
app.use("/api/v1/comment", commentRoutes)

export { app };