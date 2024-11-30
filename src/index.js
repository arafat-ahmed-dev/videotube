import { connectDB } from "./db/index.js";
import dotenv from "dotenv";
import app from "./app.js";

dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    console.log("Access Token Secret:", process.env.ACCESS_TOKEN_SECRET);
    console.log("Refresh Token Secret:", process.env.REFRESH_TOKEN_SECRET);
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("DataBase connect error in index.js", error);
  });

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
