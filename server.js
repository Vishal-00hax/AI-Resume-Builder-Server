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
  process.env.FRONTEND_URL,
];

app.use(express.json());
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (जैसे Postman या mobile apps या server-to-server requests)
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        !process.env.NODE_ENV ||
        process.env.NODE_ENV === "development"
      ) {
        callback(null, true);
      } else {
        console.log("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // अगर आप Cookies या Authorization Headers (JWT Token) भेज रहे हैं तो यह बहुत ज़रूरी है
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
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
