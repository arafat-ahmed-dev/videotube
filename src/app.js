import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();


const corsOptions = {
  origin: "http://localhost:5173", // Specify the front-end origin here
  credentials: true, // Allow credentials
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use(express.static("public"));

// Routes import
import userRouter from "./routes/user.routes.js"
import tweetRouter from "./routes/tweet.routes.js"

// Routes declaration
app.use("/api/v1/user", userRouter);
app.use("/api/v1/tweet", tweetRouter);

export default app;
