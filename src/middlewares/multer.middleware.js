import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Store files temporarily in public/temp before uploading to cloudinary
        cb(null, "./public/temp");
    },
    filename: function (req, file, cb) {
        // Keep original filename
        cb(null, file.originalname);
    }
});

export const upload = multer({
    storage
});
