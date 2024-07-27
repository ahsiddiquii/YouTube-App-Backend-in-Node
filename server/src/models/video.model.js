import mongoose, { Schema } from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";


const videoSchema = new Schema({
    videoFile: {
        type: String,
        required: true,
    },
    thumbnail: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    videoUploader: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    views: [
        {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    // views: {
    //     type: Number,
    //     default: 0
    // },
    isPublished: {
        type: Boolean,
        required: true,
        default: true,
    }

}, { timestamps: true });

videoSchema.plugin(aggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);