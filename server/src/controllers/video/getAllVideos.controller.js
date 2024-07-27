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
            throw new ApiError(400, "Invalid User ID")
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
    pipeline.push(
        {
            $addFields: {
                viewsCount: {
                    $size: "$views"
                },
                durationInMinutesAndSecond: {
                    $concat: [
                        {
                            $toString: {
                                $floor: {
                                    $divide: ["$duration", 60]
                                }
                            }
                        },
                        ":",
                        {
                            $toString: {
                                $floor: {
                                    $mod: ["$duration", 60]
                                }
                            }
                        },
                    ]
                },
                // OR 
                /* 
                durationMinutes: { 
                     $floor: { $divide: ["$duration", 60] } ,
                     $floor:  { $mod: ["$duration", 60] }
                 },
                 durationSeconds: { 
                     $floor:  { $mod: ["$duration", 60] }
                 },
                 */
            },
        },
    )

    // NOTE : 
    /*
    // 1
    Here's a detailed explanation of the two lines in the MongoDB aggregation pipeline:
    
    ### 1. `durationMinutes: { $floor: { $divide: ["$duration", 60] } }`
    
    This line calculates the number of whole minutes from the `duration` field.
    
    - **`$divide: ["$duration", 60]`**: This divides the `duration` value by 60. Since the `duration` is given in seconds, dividing by 60 converts it to minutes. For example, if `duration` is 118.249 seconds, the result of this division is approximately 1.9708 minutes.
      
    - **`$floor`**: This operator takes the largest integer less than or equal to the division result. In this example, `1.9708` minutes would be floored to `1` minute.
    
    So, this line creates a new field `durationMinutes` that contains the whole minutes part of the `duration`.
    
    ### 2. `durationSeconds: { $mod: ["$duration", 60] }`
    
    This line calculates the remaining seconds after converting the `duration` to minutes.
    
    - **`$mod: ["$duration", 60]`**: The `$mod` operator returns the remainder of the division of `duration` by 60. This effectively gives the number of seconds left after removing the whole minutes. For the same example, `118.249 % 60` results in `58.249` seconds.
    
    So, this line creates a new field `durationSeconds` that contains the remaining seconds part of the `duration`.
    
    ### Putting It All Together
    
    When you run the aggregation pipeline with these operations, the output document will include two new fields:
    
    - **`durationMinutes`**: The whole number of minutes in the `duration`.
    - **`durationSeconds`**: The remaining seconds in the `duration`.
    
    For instance, given the `duration` of `118.249` seconds:
    
    - `durationMinutes` will be `1`.
    - `durationSeconds` will be `58.249`.
    
    ### Example Document Transformation
    
    Given the initial document:
    
    ```json
    {
        "_id": "669c1bcd2de483adf15852de",
        "duration": 118.249
    }
    ```
    
    After applying the aggregation pipeline, the document would be transformed to:
    
    ```json
    {
        "_id": "669c1bcd2de483adf15852de",
        "duration": 118.249,
        "durationMinutes": 1,
        "durationSeconds": 58.249
    }
 
    // 2
    durationInMinutesAndSecond: {
                    $concat: [
                        {
                            $toString: {
                                $floor: {
                                    $divide: ["$duration", 60]
                                }
                            }
                        },
                        ":",
                        {
                            $toString: {
                                $floor: {
                                    $mod: ["$duration", 60]
                                }
                            }
                        },
                    ]
                }

    Explanation
$floor: { $divide: ["$duration", 60] }: This calculates the number of whole minutes from the duration.
$mod: ["$duration", 60]: This calculates the remaining seconds after converting the duration to minutes.
$toString: This converts the numeric values to strings so they can be concatenated.
$concat: This combines the minute and second strings with the text " minutes " and " seconds" to create the final formatted string.

    */


    // 78
    const videoAggregate = await Video.aggregate(pipeline);

    // 9
    // const options = {
    //     page: (10),
    //     limit: (10),
    // };
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
    };

    // 10
    await Video.aggregatePaginate(videoAggregate, options, (error, results) => {
        if (error) {
            console.log(error)
        } else {
            console.log(results)
        }
    });

    return res
        .status(200)
        .json(new ApiResponse(200, videoAggregate, "Videos fetched successfully"));
});

export { getAllVideos };