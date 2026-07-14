import express from "express";
import cors from "cors";
import "dotenv/config";
import connectedDataBase from "./config/data-base.js";
import userRouter from "./routes/userRoute.js";
import resumeRouter from "./routes/resumeRouter.js";
import aiRouter from "./routes/aiRouter.js";

const app = express();
const PORT = process.env.PORT || 4000;

// Database connection
await connectedDataBase();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4000",
  "https://vishaldevtribe.com",
  "https://ai-resume-builder.vishaldevtribe.com", // इसे सीधे यहाँ भी डाल दें ताकि तुरंत काम करे
  process.env.FRONTEND_URL,
];

app.use(express.json());
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (जैसे Postman या server-to-server)
      if (!origin) return callback(null, true);

      // check if origin is in allowedOrigins
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"], // यह हेडर जोड़ना ज़रूरी है
    optionsSuccessStatus: 200, // कुछ पुराने ब्राउज़र्स 204 की जगह 200 मांगते हैं
  }),
);

app.get("/", async (req, res) => {
  res.status(200).json({ message: "Server is live" });
});

app.use("/api/user/", userRouter);
app.use("/api/resume", resumeRouter);
app.use("/api/ai/", aiRouter);

app.listen(PORT, () => {
  console.log(`Server running at port: ${PORT}`);
});
