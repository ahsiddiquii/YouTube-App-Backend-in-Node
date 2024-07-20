import { User } from "../../models/user.model.js";
import { ApiError } from "../../utilities/apiError.js";
import { ApiResponse } from "../../utilities/apiResponse.js";
import { asyncHandler } from "../../utilities/asyncHandler.js";
import { fileUploadOnCloudinary, deleteFileFromCloudinary } from "../../utilities/cloudinary.config.js";


const updateUserAvatar = asyncHandler(async (req, res) => {

    // 1
    const avatarLocalPath = req.file?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file not found!")
    }

    // 2
    const cloudnaryUrlOfAvatarUpload = await fileUploadOnCloudinary(avatarLocalPath);
    if (!cloudnaryUrlOfAvatarUpload.url) {
        throw new ApiError(400, "Error uploading avatar to cloudinary!");
    }
    // console.log(cloudnaryUrlOfAvatarUpload);
    
    // 3
    // const updatedUser = await User.findByIdAndUpdate(
    //     req.user._id,
    //     {
    //         $set:
    //         {
    //             avatar: cloudnaryUrlOfAvatarUpload.url
    //         }
    //     },
    //     { new: true }).select("-password");
    // if (!updatedUser) {
    //     throw new ApiError(500, "Error updating avatar!");
    // }
    // OR 
    const user = await User.findById(req.user?._id).select("-password");
    const userOldAvatarURL = user.avatar;
    const publicIdofOldAvatar = userOldAvatarURL.split('/').slice(-1)[0].split('.')[0];
    // console.log(publicId);
    // console.log(userOldAvatar)

    user.avatar = cloudnaryUrlOfAvatarUpload.url;
    await user.save({ validateBeforeSave: false });

    //4
    await deleteFileFromCloudinary(publicIdofOldAvatar, "image");


    // 5
    return res
        .status(200)
        .json(new ApiResponse(200, user, "Avatar Image updated successfully"))



});

export { updateUserAvatar };