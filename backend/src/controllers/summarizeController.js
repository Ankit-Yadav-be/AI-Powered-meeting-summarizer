import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

// TXT se text extract karne ka helper
const extractTextFromTXT = async (fileBuffer) => {
  try {
    return fileBuffer.toString("utf-8"); // buffer ko string me convert
  } catch (err) {
    console.error("[extractTextFromTXT] TXT parsing error:", err);
    throw new Error("Failed to parse TXT file");
  }
};

export const generateSummary = async (req, res) => {
  try {
    console.log("[generateSummary] Gemini API Key:", process.env.GEMINI_API_KEY);

    const { transcript, prompt } = req.body;
    let finalText = transcript?.trim() || "";

    // Agar TXT file upload hui hai
    if (req.file && req.file.buffer) {
      const fileExt = req.file.originalname.split(".").pop().toLowerCase();
      if (fileExt !== "txt") {
        return res.status(400).json({ error: "Unsupported file type. Only TXT allowed." });
      }

      console.log("[generateSummary] TXT file received:", req.file.originalname);
      finalText = await extractTextFromTXT(req.file.buffer);
    }

    // Agar na transcript ho na file
    if (!finalText) {
      return res.status(400).json({ error: "Please provide a TXT file or transcript text." });
    }

    if (!prompt?.trim()) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    // Prompt for Gemini AI
    const userInstruction = `
You are a professional meeting/document summarizer with expertise in making content understandable and actionable.

Content:
${finalText}

User Instruction:
${prompt}

Requirements for the summary:
1. Start with a concise title and meeting metadata if available.
2. Present "Key Highlights" in descriptive bullet points.
3. Present "Responsibilities" as clear sentences assigning tasks to individuals.
4. Present "Action Items" as clear instructions or next steps.
5. Maintain a professional, natural, and explanatory tone.
6. Highlight important numbers, dates, deadlines, names, and other critical details.
7. Use only plain text, avoid markdown or AI-like phrasing.
8. Each bullet should provide context.
9. Make the summary cohesive and readable for someone who did not attend the meeting.
`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(userInstruction);
    let summary = result.response.text().trim();

    // Clean unwanted symbols
    summary = summary.replace(/\*\*/g, "").replace(/#+/g, "").replace(/_/g, "");

    res.status(200).json({ summary });
  } catch (error) {
    console.error("[generateSummary] Error:", error);

    if (error.response?.status === 401) {
      return res.status(401).json({ error: "Invalid Gemini API Key." });
    }

    res.status(500).json({ error: "Failed to generate summary." });
  }
};
