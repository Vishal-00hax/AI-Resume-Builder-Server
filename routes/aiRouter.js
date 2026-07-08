import express from "express";
import userAuth from "../middelware/authMiddleware.js";
import {
  enhanceProfessionalSummary,
  enhanceJobDiscription,
  uploadResume,
} from "../controller/aiController.js";

const aiRouter = express.Router();

aiRouter.post("/enhance-pro-sum", userAuth, enhanceProfessionalSummary);
aiRouter.post("/enhance-job-disc", userAuth, enhanceJobDiscription);
aiRouter.post("/upload-resume", userAuth, uploadResume);

export default aiRouter;
