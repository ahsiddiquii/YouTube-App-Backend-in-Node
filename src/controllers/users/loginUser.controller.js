import { ApiError } from "../../utilities/apiError.js";
import { ApiResponse } from "../../utilities/apiResponse.js";
import { asyncHandler } from "../../utilities/asyncHandler.js";
import { User } from "../../models/user.model.js"

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });


        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating Refresh and Access Token",)
    }
}

const loginUser = asyncHandler(async (req, res) => {

    // 1- Get data from req.body ✅
    const { username, email, password } = req.body;
    // console.log(username, email, password); 
    
    if (!(username || email)) {
        throw new ApiError(400, "Username OR Email is required")
    };

    // 2- Find user in database; ✅
    const userExistance = await User.findOne({
        $or: [{ username }, { email }]
    });
    // console.log(userExistance);
    if (!userExistance) {
        // throw new ApiError(400, `User with ${username} or ${email} is not found`)
        console.log(`User with ${username} or ${email} is not found`);
    };

    
    // 3- Check the Password if correct: ✅

    const isPasswordValid = await userExistance.isPasswordCorrect(password);
    // console.log(isPasswordValid);
    if (!isPasswordValid) {
        throw new ApiError(400, "Password is incorrect")
    };

    // 4- Access & Refresh Token: ✅

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(userExistance._id);

    // 5- Get LoggedIn User/ LoggedIn User with Refresh Token: ✅
    const LoggedInUserwithOutRefreshToken = await User.findById(userExistance._id).select("-password -refreshToken");

    // console.log(LoggedInUserwithRefreshToken)

    // 6- Set Security Options for Cookie: ✅
    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, {
                user: LoggedInUserwithOutRefreshToken, accessToken, refreshToken,
            },
                "User Logged In Successfully"
            )
        );

});


export { generateAccessAndRefreshToken, loginUser };