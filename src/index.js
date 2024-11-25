import express from "express";
import mongoose from "mongoose";
import { connectDB } from "./db/index.js";
import dotenv from "dotenv";


dotenv.config(
    {
        path: "./env",
    }
)




connectDB()



// ; (async () => {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_name}`);
//         console.log('Connected to MongoDB');
//         app.on("error", (err) => {
//             console.error(err);
//         });
//         app.listen(process.env.PORT, () => {
//             console.log('Server is running on port 3000');
//         });
//     } catch (error) {
//         console.log("Error", error)
//     }
// })()