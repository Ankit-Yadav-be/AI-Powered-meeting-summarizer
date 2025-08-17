import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import pdf from "pdf-parse";

dotenv.config();

// PDF se text extract karne ka helper function (buffer ke liye)
const extractTextFromPDF = async (fileBuffer) => {
  console.log("[extractTextFromPDF] PDF buffer received:", fileBuffer?.length, "bytes");
  try {
    const pdfData = await pdf(fileBuffer);
    console.log("[extractTextFromPDF] PDF text length:", pdfData.text.length);
    return pdfData.text; // pure text
  } catch (err) {
    console.error("[extractTextFromPDF] Error parsing PDF:", err);
    throw err;
  }
};

export const generateSummary = async (req, res) => {
  try {
    console.log("[generateSummary] Gemini API Key:", process.env.GEMINI_API_KEY);

    const { transcript, prompt } = req.body;
    console.log("[generateSummary] Transcript length:", transcript ? transcript.length : 0);
    console.log("[generateSummary] Prompt received:", !!prompt);

    let finalText = transcript;

    // Agar user ne PDF upload kiya hai to use karo (memoryStorage ke liye)
    if (req.file) {
      console.log("[generateSummary] PDF received in memory:", req.file.originalname);
      console.log("[generateSummary] PDF mimetype:", req.file.mimetype);
      console.log("[generateSummary] PDF buffer size:", req.file.buffer.length, "bytes");

      // ERROR SOURCE CHECK:
      if (!req.file.buffer) {
        console.error("[generateSummary] ERROR: req.file.buffer is missing! Cannot parse PDF.");
        return res.status(400).json({ error: "PDF buffer missing. Upload failed?" });
      }

      finalText = await extractTextFromPDF(req.file.buffer); // buffer use karo
      console.log("[generateSummary] Extracted PDF text length:", finalText.length);
    } else {
      console.log("[generateSummary] No PDF uploaded, using transcript.");
    }

    if (!finalText || !prompt) {
      console.warn("[generateSummary] ERROR: Missing finalText or prompt.");
      return res
        .status(400)
        .json({ error: "Transcript ya PDF text aur prompt required hai" });
    }

    // Improved Prompt Engineering
    const userInstruction = `
You are a professional meeting/document summarizer with expertise in making any content understandable and actionable. 
Your goal is to generate a human-like, natural, and clear summary that explains the meeting outcomes as if a project manager is recapping to the team. Analyze the transcript thoroughly, as it may contain informal, unstructured, or partial text, and produce the best possible summary regardless.

Content:
${finalText}

User Instruction:
${prompt}

Requirements for the summary:
1. Start with a concise title and, if available, meeting metadata such as date and attendees.
2. Present "Key Highlights" in descriptive bullet points, written like human explanations of discussions, decisions, and insights.
3. Present "Responsibilities" as clear human-readable sentences assigning tasks to individuals. 
   Example: "1.Ankit will handle system state management and notifications."
   Add a line break between each responsibility.
4. Present "Action Items" as clear instructions or next steps.
   Example: "Khushi needs to finalize the profile setup UI by next week."
5. Maintain a professional, natural, and explanatory tone — avoid robotic or generic phrasing.
6. Highlight important numbers, dates, deadlines, names, and other critical details.
7. Use only plain text. Avoid any markdown symbols, formatting tags, or AI-like phrasing.
8. Avoid one-word or robotic bullet points; each bullet should be a descriptive sentence providing context.
9. Make the summary cohesive and readable for someone who did not attend the meeting.

Generate the structured summary below:
`;

    console.log("[generateSummary] Sending instruction to Gemini AI, length:", userInstruction.length);
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(userInstruction);
    let summary = result.response.text().trim();

    // Clean unwanted markdown symbols
    summary = summary.replace(/\*\*/g, "").replace(/#+/g, "").replace(/_/g, "");

    console.log("[generateSummary] Summary generated, length:", summary.length);

    res.status(200).json({ summary });
  } catch (error) {
    console.error("[generateSummary] Error in generateSummary:", error);

    if (error.response?.status === 401) {
      return res
        .status(401)
        .json({ error: "Invalid Gemini API Key. Please check your key." });
    }

    res.status(500).json({ error: "Failed to generate summary" });
  }
};
