import { User } from "../../models/user.model.js";
import { ApiError } from "../../utilities/apiError.js";
import { ApiResponse } from "../../utilities/apiResponse.js";
import { asyncHandler } from "../../utilities/asyncHandler.js";

const changeUserPassword = asyncHandler(async (req, res) => {

    // 1 
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    // 2
    const loggedInUser = await User.findById(req.user._id);

    //  3
    const checkOldPassword = await loggedInUser.isPasswordCorrect(oldPassword);

    if (!checkOldPassword) {
        throw new ApiError(400, "Wrong Old Password");
    }

    // 4
    if (newPassword !== confirmNewPassword) {
        throw new ApiError(400, "New Password & Confirm New Password are not same")
    };

    // 5
    loggedInUser.password = newPassword;
    console.log(loggedInUser)
    await loggedInUser.save({ validateBeforeSave: false });

    // 6
    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, `${loggedInUser.fullName} you have successfully changed your password`)
        )




});

export { changeUserPassword };