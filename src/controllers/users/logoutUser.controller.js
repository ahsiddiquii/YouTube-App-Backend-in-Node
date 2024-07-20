import { User } from "../../models/user.model.js";
import { ApiResponse } from "../../utilities/apiResponse.js";
import { asyncHandler } from "../../utilities/asyncHandler.js";

const logoutUser = asyncHandler(async (req, res) => {
    // Find logged In user FROM database and remove refresh token from it.
    const user = await User.findByIdAndUpdate(req.user._id,
        {
            // $set:{refreshToken: undefined } OR 👇🏻👇🏻
            $unset: { refreshToken: 1 } // This removes that field form the document
        },
        {
            new: true,
        }
    );

    // 2- Set Security Options for Cookie:
    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(201)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, `${user.fullName} logged Out successfully`));
});

export { logoutUser };