import express from "express";
import multer from "multer";
import { generateSummary } from "../controllers/summarizeController.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("pdfFile"), generateSummary);

export default router;
