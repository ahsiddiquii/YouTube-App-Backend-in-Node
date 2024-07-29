import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new Schema({
    commentContent: {
        type: String,
        required: true,
    },
    videoId: {
        type: Schema.Types.ObjectId,
        ref: "Video",
        required: true,
    },
    commentOwner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true }
);

commentSchema.plugin(mongooseAggregatePaginate);

export const Comment = mongoose.model("Comment", commentSchema)
