import multer from "multer";
import path from "path";

// Storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// File filter (optional)
const fileFilter = (req, file, cb) => {
    const allowed = ["image/png", "image/jpg", "image/jpeg","image/webp","image/avif"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only JPG, PNG and JPEG allowed"), false);
};

const upload = multer({ storage, fileFilter });

export default upload
