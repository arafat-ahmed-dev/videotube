import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

const uploadonCloudinary = async (file) => {
  try {
    if (!file) return null;
    const response = await cloudinary.uploader.upload(file ,
      {
        resource_type : "auto"
      }
    );
    console.log("File Uploaded Successfully", response);
    return response;
  } catch (error) {
    fs.unlink(file)
    console.error("Failed to send Image in Cloudinary !! ",error);
    return null
  }
};

export default uploadonCloudinary;