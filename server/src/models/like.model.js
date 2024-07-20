import mongoose, { Schema, model } from "mongoose";

const likeSchema = new Schema({
    likedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video",
        required: true
    },
    tweet: {
        type: Schema.Types.ObjectId,
        ref: "Tweet",
        required: true
    },
    comment: {
        type: Schema.Types.ObjectId,
        ref: "Comment",
        required: true
    },

}, { timestamps: true });

export const Like = model("Like", likeSchema)