import { User } from "../models/user.model.js";
import { ApiError } from "../utilities/apiError.js";
import { asyncHandler } from "../utilities/asyncHandler.js";
import jwt from "jsonwebtoken";


const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        // Get the access token from the request cookies or the "Authorization" header
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        if (!token) {
            throw new ApiError(401, "You are not logged in")
        }

        // If token exist OR If User exist check if token is valid and check what informations are in the token.

        const decodedTokenInfo = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Find user from database without password and refresh token;
        const user = await User.findById(decodedTokenInfo.id).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "Invalid access token, SignUp Please")
        }

        // Set user object in req.user.
        req.user = user;

        next();
    } catch (error) {
        throw new ApiError(401, error.message || "Invalid access token");
    }
});

export { verifyJWT };