import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();


const extractTextFromTXT = async (fileBuffer) => {
  try {
    return fileBuffer.toString("utf-8"); 
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

    
    if (req.file && req.file.buffer) {
      const fileExt = req.file.originalname.split(".").pop().toLowerCase();
      if (fileExt !== "txt") {
        return res.status(400).json({ error: "Unsupported file type. Only TXT allowed." });
      }

      console.log("[generateSummary] TXT file received:", req.file.originalname);
      finalText = await extractTextFromTXT(req.file.buffer);
    }

   
    if (!finalText) {
      return res.status(400).json({ error: "Please provide a TXT file or transcript text." });
    }

    if (!prompt?.trim()) {
      return res.status(400).json({ error: "Prompt is required." });
    }

   
const userInstruction = `
You are an expert meeting and document summarizer. Your goal is to produce a **human-level, professional, and actionable summary** that reads as if written by a senior project manager, without sounding like AI-generated text.

Content:
${finalText}

User Instruction:
${prompt}

Guidelines for creating the summary:
1. Begin with a **concise and descriptive title** including meeting date, attendees, and topic if available.
2. Provide **Key Highlights** in detailed bullet points. Each bullet should fully explain discussions, decisions, insights, and context, as if summarizing for someone who did not attend.
3. Clearly list **Responsibilities**, assigning tasks to specific individuals with deadlines where possible. Use natural, human language.
4. Clearly state **Action Items** with actionable next steps for each relevant participant. Include timelines if mentioned.
5. Maintain a **professional, natural, and narrative style**; avoid robotic, generic, or AI-like phrasing.
6. Emphasize important numbers, dates, deadlines, names, and other critical details naturally within sentences.
7. Use **plain text only**, no markdown, emojis, or formatting symbols.
8. Ensure every bullet and sentence provides context and reads fluidly.
9. Make the summary **cohesive, logically structured, and easy to read**, as if written for executive-level understanding.
10. Keep a **human tone**, including transitions and natural explanations, making it indistinguishable from a human-written summary.

Generate the structured summary below based on these guidelines:
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
