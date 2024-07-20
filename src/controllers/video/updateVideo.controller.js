import { asyncHandler } from "../../utilities/asyncHandler.js";
import { ApiResponse } from "../../utilities/apiResponse.js";
import { ApiError } from "../../utilities/apiError.js";
import { Video } from "../../models/video.model.js";
import { isValidObjectId } from "mongoose";
import { deleteFileFromCloudinary, fileUploadOnCloudinary } from "../../utilities/cloudinary.config.js";

const updateVideo = asyncHandler(async (req, res) => {
    // 1- Get Video Id to update video from params. ✅
    // 2- Check if video Id is valid. ✅
    // 3- Check if user is video uploader. ✅
    // 4- Check if title and description are present. ✅
    // 5- Check if thumbnail is present. If not present remain old thumbnail. ✅
    // 6- If thumbnail is present upload thumbnail on cloudinary. ✅
    // 7- Check if thumbnail is successfully uploaded on cloudinary. ✅
    // 8- Update video Details in database. ✅
    // 9- Check if video is successfully updated in database. ✅
    // 10- Remove Old thumbnail from cloudinary. ✅
    // 11- Send updated video to frontend. ✅


    const { videoId } = req.params;
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video Id")
    }
    console.log(videoId)
    // if (!videoId || videoId.length < 24) {
    //     throw new ApiError(400, "Invalid Video ID")
    // }
    const videotoUpdate = await Video.findById(videoId);
    if (videotoUpdate.videoUploader.toString() != req.user?._id.toString()) {
        throw new ApiError(400, "Only video uploader has rights to update video details")
    }

    let { title, description } = req.body;
    if (!title) {
        title = videotoUpdate.title
    }
    if (!description) {
        description = videotoUpdate.description
    }

    let newThumbnail;
    let thumbnailLocalPath = req.file?.path;
    if (thumbnailLocalPath) {
        newThumbnail = await fileUploadOnCloudinary(thumbnailLocalPath);
        if (!newThumbnail) {
            throw new ApiError(400, "Error while uploading thumbnail on cloudinary")
        }
    }
    else {
        newThumbnail = videotoUpdate.thumbnail;

    }


    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title,
                description,
                thumbnail: newThumbnail.url
            }
        },
        { new: true }
    )

    if (!updatedVideo) {
        throw new ApiError(500, "Failed to update video please try again")
    }

    await deleteFileFromCloudinary(videotoUpdate.thumbnail.split('/').slice(-1)[0].split('.')[0]);


    return res.status(200).json(
        new ApiResponse(200, updatedVideo, "Video Details updated successfully")
    )


});

export { updateVideo };