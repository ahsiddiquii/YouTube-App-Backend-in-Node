import jwt from "jsonwebtoken";
import { ApiError } from "../../utilities/apiError.js";
import { asyncHandler } from "../../utilities/asyncHandler.js";
import { User } from "../../models/user.model.js";
import { generateAccessAndRefreshToken } from "./loginUser.controller.js";
import { ApiResponse } from "../../utilities/apiResponse.js";

const refreshAccessToken = asyncHandler(async (req, res) => {
    // 1
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request");
    };
    try {
        // 2
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        // 3
        const user = await User.findById(decodedToken.id);
        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        };

        // 4
        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "Refresh token is expired");
        }

        // 5 
        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
        // console.log("accessToken", accessToken);
        // console.log("refreshToken", refreshToken);

        // 6 
        const options = {
            httpOnly: true,
            secure: true,
        }

        // 
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken,
                        refreshToken,
                    },
                    "Access Token Refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(400, error?.message || "Invalid refresh token")
    }



});

export { refreshAccessToken };