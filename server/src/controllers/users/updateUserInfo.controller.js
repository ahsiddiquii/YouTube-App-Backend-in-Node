import { User } from "../../models/user.model.js";
import { ApiError } from "../../utilities/apiError.js";
import { ApiResponse } from "../../utilities/apiResponse.js";
import { asyncHandler } from "../../utilities/asyncHandler.js";


const updateUserInfo = asyncHandler(async (req, res) => {

    // 1
    const { newFullName, newEmail } = req.body;

    if (!newFullName && !newEmail) {
        throw new ApiError(401, "Please fill any one field")
    }

    // 2
    const currentUser = await User.findById(req.user?._id).select("-paswword -refreshToken");

    // 3
    const oldFullName = currentUser.fullName;
    const oldEmail = currentUser.email;
    // console.log(oldFullName);


    // 3
    if ((newFullName && newFullName.trim() === oldFullName) || (newEmail && newEmail.trim() === oldEmail)) {
        throw new ApiError(401, "Updated value is same as previous value")
    }


    // 4
    if (newFullName) {
        currentUser.fullName = newFullName.trim();
    } else if (newEmail) {
        currentUser.email = newEmail.trim();
    }
    // 4
    await currentUser.save({ validateBeforeSave: false });

    // 5

    return res
        .status(200)
        .json(new ApiResponse(200, { user: currentUser },
            `${newFullName ? `Your Full name has been changed from (${oldFullName}) to (${newFullName})` : `${newEmail ? `Your email has been changed from (${oldEmail}) to (${newEmail})` : ""}`}`))


});

export { updateUserInfo };