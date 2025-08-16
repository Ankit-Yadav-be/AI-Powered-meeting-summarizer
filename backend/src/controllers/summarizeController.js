import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { Readable } from "stream";

dotenv.config();

export const generateSummary = async (req, res) => {
  try {
    const { transcript, prompt } = req.body;
    let finalText = transcript;

    // Agar PDF upload hai
    if (req.file) {
      console.log("PDF buffer detected. Using LangChain PDFLoader directly from buffer...");

      // Convert buffer to Readable stream (PDFLoader accepts fs path or stream)
      const stream = Readable.from(req.file.buffer);

      // PDFLoader init using stream
      const loader = new PDFLoader(stream, {
        splitPages: false,               // agar page-wise nahi chahiye
        parsedItemSeparator: "",         // extra spaces remove
        pdfjs: () => import("pdfjs-dist/legacy/build/pdf.js") // custom pdfjs
      });

      const docs = await loader.load();
      finalText = docs.map(d => d.pageContent).join("\n\n");
    }

    if (!finalText || !prompt) {
      return res.status(400).json({ error: "Transcript ya PDF aur prompt required hai" });
    }

    const userInstruction = `
You are a professional meeting/document summarizer...
Content:
${finalText}
User Instruction:
${prompt}
Requirements for the summary:
1. Concise title, key highlights, responsibilities, action items.
2. Human-readable, plain text.
`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(userInstruction);
    let summary = result.response.text().trim();
    summary = summary.replace(/\*\*/g, "").replace(/#+/g, "").replace(/_/g, "");

    res.status(200).json({ summary });
  } catch (error) {
    console.error("Error in generateSummary:", error);
    res.status(500).json({ error: "Failed to generate summary" });
  }
};
