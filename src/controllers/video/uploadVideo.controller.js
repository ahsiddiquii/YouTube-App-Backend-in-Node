import { asyncHandler } from "../../utilities/asyncHandler.js";
import { ApiResponse } from "../../utilities/apiResponse.js";
import { ApiError } from "../../utilities/apiError.js";
import { fileUploadOnCloudinary } from "../../utilities/cloudinary.config.js";
import { Video } from "../../models/video.model.js";

const uploadVideo = asyncHandler(async (req, res) => {
    // 1- Get title, description, video File and Thumbnail from front. ✅
    // 2- Check title, description, video File and Thumbnail are present. ✅
    // 3- Upload video file and thumbnail on cloudinary. ✅
    // 4- Check if video and thubmnail are successfully uploaded on Cloudinary. ✅
    // 5- Create video object and save in database.✅
    // 6- Return reponse to front end. ✅


    const { title, description } = req.body;
    if ([title, description].some(val => val.trim() === "")) {
        throw new ApiError(400, "Title and Description must be required!");
    }
    let videoFilePath;
    if (req.files && Array.isArray(req.files.videoFile) && req.files.videoFile.length > 0) {
        videoFilePath = req.files.videoFile[0].path;
    }
    let thumbnailPath;
    if (req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0) {
        thumbnailPath = req.files.thumbnail[0].path;
    }
    const videoFile = await fileUploadOnCloudinary(videoFilePath);
    const thumbnail = await fileUploadOnCloudinary(thumbnailPath);
    if (!videoFile || !thumbnail) {
        throw new ApiError(400, `${!videoFile ? "Error while uploading video on cloudinary" : "Error while uploading thumbnail on cloudinary"}`);
    };

    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title,
        description,
        videoUploader: req.user?._id,
        duration: videoFile.duration,
        isPublished: true
    });

    const createdVideo = await Video.findById(video._id)
    
    if(!createdVideo){
        throw new ApiError(401, "Something wrong while Adding a video")
    }

    
    return res
        .status(200)
        .json(
            new ApiResponse(200, video, "Video Uploaded Successfully")
        )

});

export { uploadVideo };