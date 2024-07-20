import { asyncHandler } from "../../utilities/asyncHandler.js";
import { ApiError } from "../../utilities/apiError.js";
import { User } from "../../models/user.model.js"
import { fileUploadOnCloudinary } from "../../utilities/cloudinary.config.js"
import { ApiResponse } from "../../utilities/apiResponse.js";

const userRegister = asyncHandler(async (req, res) => {

    // 1- Get user's details from frontend:
    const { username, email, fullName, password } = req.body;
    // console.log("Email : ", email);

    // 2- Validation - Not Empty:
    if (
        [username, email, fullName, password].some(value => value?.trim() === "")
    ) {
        throw new ApiError(400, "All field are required");
    }
    // OR
    // if (!username || !email || !fullName || !password) {
    //     throw new ApiError(400, "Please fill in all required fields");
    // }

    // 3-  Check if user already exists ( search by username and email);
    const userExsistance = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (userExsistance) {
        throw new ApiError(409, "User with email or password already exists.")
    }

    // 4- Check for Images, (Avatar is Required!);
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    // OR
    
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }


    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar Image is required")
    }

    // 5- Upload Avatar and Cover Image on Cloudinary:
    const avatarImage = await fileUploadOnCloudinary(avatarLocalPath);
    const coverImage = await fileUploadOnCloudinary(coverImageLocalPath);
    if (!avatarImage) {
        throw new ApiError(400, "Avatar Image is required");
    };

    // 6- Create user Object (Create entry in Database):

    const user = await User.create({
        username: username.toLowerCase(),
        email,
        fullName,
        password,
        avatar: avatarImage.url,
        coverImage: coverImage?.url || "",
    })

    // 7- Remove Password and RefreshToken:

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "User not created");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User created successfully")
    )

});

export { userRegister };
