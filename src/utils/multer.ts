import multer, { diskStorage, FileFilterCallback } from "multer";
import { Request } from "express";
import { extname } from "path";

const upload = multer({
  storage: diskStorage({}),
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) => {
    const ext = extname(file.originalname).toLowerCase();
    if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
      // Explicitly typecast Error to satisfy TypeScript
      cb(new Error("File type is not supported") as unknown as null, false);
    } else {
      cb(null, true); // No error, so `null` is passed as the first argument
    }
  },
});

const multipleUpload = upload.fields([
  { name: "poster", maxCount: 1 },
  { name: "about", maxCount: 1 },
]);

export { multipleUpload };
export default upload;
