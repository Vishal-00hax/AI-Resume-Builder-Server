import express from "express";
import cors from "cors";
import "dotenv/config";
import connectedDataBase from "./config/data-base.js";

const app = express();
const PORT = process.env.PORT || 4000;

// Database connection
await connectedDataBase();

app.use(express.json());
app.use(cors());

app.get("/", async (req, res) => {
  res.status(200).json({ message: "Server is live" });
});

app.listen(PORT, () => {
  console.log(`Server running at port: ${PORT}`);
});
