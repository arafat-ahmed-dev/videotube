import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

export const connectDB = async () => {
    try {
       const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log('MongoDB Connected...' + connectionInstance.connections[0].host);
        return connectionInstance
    } catch (error) {
        console.log("MongoDB connection failed. Exiting now...", error);
        process.exit(1)
    }
}