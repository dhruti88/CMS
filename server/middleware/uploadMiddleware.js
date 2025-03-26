import multer from "multer";

// Store image as buffer
const storage = multer.memoryStorage(); // Use memory storage for binary data

// File type validation
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, JPG, and PNG are allowed."), false);
  }
};

// Set limits and filters
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB Limit
  },
});

export default upload;
