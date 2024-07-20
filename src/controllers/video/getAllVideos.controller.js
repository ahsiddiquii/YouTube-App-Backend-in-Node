import { asyncHandler } from "../../utilities/asyncHandler.js";
import { ApiResponse } from "../../utilities/apiResponse.js";
import { ApiError } from "../../utilities/apiError.js";
import { Video } from "../../models/video.model.js";
import mongoose, { isValidObjectId } from "mongoose";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

    // 1
    let pipeline = [];

    // 2
    pipeline.push({
        $match: {
            isPublished: true,
        }
    });

    // 3
    if (query) {
        pipeline.push({
            $search: {
                index: "searchIndex",
                text: {
                    query,
                    path: ["title", "description"],
                },
            },
        })
    };

    // 4
    if (userId) {
        if (!isValidObjectId(userId)) {
            throw new ApiError("Invalid User ID")
        }
        pipeline.push(
            {
                $match: {
                    videoUploader: new mongoose.Types.ObjectId(userId),
                }
            },
        )
    };

    // 5
    //sortBy can be views, createdAt, duration
    //sortType can be ascending(1) or descending(-1)
    if (sortType && sortBy) {
        pipeline.push(
            {
                $sort: {
                    [sortBy]: sortType === "asc" ? 1 : -1,
                    // createdAt: 1,
                }

            }
        )
    }
    else {
        pipeline.push(
            {
                $sort: {
                    createdAt: -1,
                }
            }
        )
    }
    // NOTES: Why We Put `sortBy` in an Array
    /*

    //  Answer

    // In the given code, the `sortBy` variable is enclosed in square brackets within the `$sort` stage of the MongoDB aggregation pipeline. This is a JavaScript feature known as computed property names.

    // ### Explanation

    // 1. **Computed Property Names**:
    //    - In JavaScript, square brackets allow for the use of a variable as the key in an object. This is known as computed property names.

    //    - Example:
    //      javascript
    //      let fieldName = "name";
    //      let obj = { [fieldName]: "John" };
    // This is equivalent to: let obj = { "name": "John" };


    //  2. ** Dynamic Field Sorting **:
    //  - The`sortBy` variable holds the name of the field by which the documents should be sorted.
    // - By using`[sortBy]`, the code dynamically sets the field for sorting based on the value of`sortBy`.
    // - This is useful when you need to sort documents based on user input or other dynamic conditions.
    */

    // 6
    pipeline.push(
        {
            $lookup: {
                from: "users",
                localField: "videoUploader",
                foreignField: "_id",
                as: "videoOwner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            },

        },
        {
            $addFields: {
                videoOwner: {
                    $arrayElemAt: ["$videoOwner", 0],
                },
            },
        },
        // OR
        // {
        //     $unwind: "$videoOwner"
        // }
    );

    // 7
    const videoAggregate = await Video.aggregate(pipeline);

    // 8
    const options = {
        page : parseInt(page, 10),
        limit: parseInt(limit, 10),
    }

    // 9
    const videos = await Video.aggregatePaginate(videoAggregate, options);

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

export { getAllVideos };