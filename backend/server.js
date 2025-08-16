import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import summarizeRoutes from "./src/routes/summarizeRoute.js";
import emailRoutes from "./src/routes/emailRoute.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/api/summarize", summarizeRoutes);
app.use("/api/send-email", emailRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
