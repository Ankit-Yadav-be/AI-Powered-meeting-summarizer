import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import PDFParser from "pdf2json";

dotenv.config();

// PDF buffer se text extract karne ka helper
const extractTextFromPDFBuffer = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on("pdfParser_dataError", (err) => reject(err.parserError));
    pdfParser.on("pdfParser_dataReady", (pdfData) => {
      try {
        let text = pdfData.Pages.map((page) =>
          page.Texts.map((t) =>
            decodeURIComponent(t.R.map((r) => r.T).join(""))
          ).join(" ")
        ).join("\n\n");
        resolve(text);
      } catch (err) {
        reject(err);
      }
    });

    pdfParser.parseBuffer(fileBuffer); // <-- buffer se parse karenge
  });
};

export const generateSummary = async (req, res) => {
  try {
    const { transcript, prompt } = req.body;
    let finalText = transcript;

    // Agar PDF upload kiya gaya hai to buffer se extract karo
    if (req.file) {
      console.log("Uploaded PDF buffer available");
      finalText = await extractTextFromPDFBuffer(req.file.buffer);
    }

    if (!finalText || !prompt) {
      return res
        .status(400)
        .json({ error: "Transcript ya PDF text aur prompt required hai" });
    }

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

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(userInstruction);

    let summary = result.response.text().trim();

    // Clean unwanted markdown symbols
    summary = summary.replace(/\*\*/g, "").replace(/#+/g, "").replace(/_/g, "");

    res.status(200).json({ summary });
  } catch (error) {
    console.error("Error in generateSummary:", error);

    if (error.response?.status === 401) {
      return res
        .status(401)
        .json({ error: "Invalid Gemini API Key. Please check your key." });
    }

    res.status(500).json({ error: "Failed to generate summary" });
  }
};
