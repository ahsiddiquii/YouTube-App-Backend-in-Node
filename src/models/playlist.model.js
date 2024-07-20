import mongoose, { Schema } from "mongoose";


const playlistSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video",
        required: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }
}, { timestamps: true });


export const Playlist = mongoose.model("Playlist", playlistSchema);
