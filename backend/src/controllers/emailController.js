import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const sendEmail = async (req, res) => {
  try {
    const { recipients, subject, message } = req.body;

    if (!recipients || recipients.length === 0 || !message) {
      return res
        .status(400)
        .json({ error: "Recipients and message are required" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
      },
    });

 
    const mailOptions = {
      from: `"Meeting Summarizer" <${process.env.EMAIL_USER}>`,
      to: recipients.join(","), 
      subject: subject || "Meeting Summary",
      text: message,
      html: `<p>${message.replace(/\n/g, "<br>")}</p>`, 
    };

    
    await transporter.sendMail(mailOptions);

    console.log("Email sent to:", recipients);
    res
      .status(200)
      .json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Error in sendEmail:", error);

    if (error.code === "EAUTH") {
      return res.status(401).json({
        error:
          "Authentication failed. Check EMAIL_USER and EMAIL_PASS (use App Password).",
      });
    }

    res.status(500).json({ error: "Failed to send email" });
  }
};
