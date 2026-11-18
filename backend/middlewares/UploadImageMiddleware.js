import multer from "multer";

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb({ message: "Unsupported file format" }, false);
  }
};

export const uploadImage = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

export const uploadImageSingle = (field) => uploadImage.single(field);
export const uploadImageMultiple = (fields) => uploadImage.fields(fields);
