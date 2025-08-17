import express from "express";
import multer from "multer";
import { generateSummary } from "../controllers/summarizeController.js";

const router = express.Router();

// Multer memory storage (Vercel-friendly)
const storage = multer.memoryStorage();

const upload = multer({ storage });

// Route with multer middleware
router.post("/", upload.single("pdfFile"), generateSummary);

export default router;
