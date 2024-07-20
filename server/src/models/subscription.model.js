import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
    {
        subscriber: {
            type: mongoose.Schema.Types.ObjectId, // ONE WHO IS SUBSCRIBING...
            ref: "User"
        },
        channel: {
            type: mongoose.Schema.Types.ObjectId, // ONE WHOME "SUBSCRIBER" IS SUBSCRIBING...
            ref: "User"
        }
    },
    { timestamps: true });

export const Subscription = mongoose.model("Subscription", subscriptionSchema);