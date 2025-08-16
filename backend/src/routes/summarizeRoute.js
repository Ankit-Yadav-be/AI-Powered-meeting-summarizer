import express from "express";
import multer from "multer";
import { generateSummary } from "../controllers/summarizeController.js";

const router = express.Router();

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // PDF uploads folder me save hoga
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // unique filename banega
  },
});

// Multer instance
const upload = multer({ storage });

// Route with multer middleware
router.post("/", upload.single("pdfFile"), generateSummary);

export default router;
