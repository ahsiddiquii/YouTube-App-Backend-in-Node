import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.express.js";

dotenv.config({
    path: "./.env"
});


(async () => {
    try {
        let mongoDBHost = await connectDB();
        console.log(`MongoDB Connected: DB Host: ${mongoDBHost}`);
        app.on("error", (err) => {
            console.error("ERROR: ", err)
            throw err
        })
        app.listen(process.env.PORT || 4000, () => {
            console.log(`Server is created successfully and listening at port: ${process.env.PORT}`)
        })
    } catch (error) {
        console.log(error);
    }
})()


