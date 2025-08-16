import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PDFDocument } from "pdf-lib";

dotenv.config();

// PDF buffer se text extract karne ka helper
const extractTextFromPDFBuffer = async (fileBuffer) => {
  try {
    const pdfDoc = await PDFDocument.load(fileBuffer);
    const pages = pdfDoc.getPages();

    let fullText = "";
    for (const page of pages) {
      // pdf-lib directly text extraction nahi deta, alternative approach:
      // annotations aur text items iterate karke extract karte hain
      const textContent = page.getTextContent?.(); // optional chaining in case not supported
      if (textContent?.items) {
        fullText += textContent.items.map((i) => i.str).join(" ") + "\n\n";
      }
    }

    // Agar text empty hua, fallback message
    return fullText || "PDF text extraction failed or empty PDF";
  } catch (err) {
    console.error("PDF parse error:", err);
    throw new Error("Failed to parse PDF file");
  }
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
Content:
${finalText}

User Instruction:
${prompt}

Requirements for the summary:
1. Start with a concise title and, if available, meeting metadata such as date and attendees.
2. Present "Key Highlights" in descriptive bullet points, written like human explanations of discussions, decisions, and insights.
3. Present "Responsibilities" as clear human-readable sentences assigning tasks to individuals. 
4. Present "Action Items" as clear instructions or next steps.
5. Maintain a professional, natural, and explanatory tone — avoid robotic or generic phrasing.
6. Highlight important numbers, dates, deadlines, names, and other critical details.
7. Use only plain text.
8. Avoid one-word or robotic bullet points; each bullet should be a descriptive sentence providing context.
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
    console.error("Error in generateSummary:", error);

    if (error.response?.status === 401) {
      return res
        .status(401)
        .json({ error: "Invalid Gemini API Key. Please check your key." });
    }

    res.status(500).json({ error: "Failed to generate summary" });
  }
};
