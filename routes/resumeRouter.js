import express from "express";
import userAuth from "../middelware/authMiddleware.js";
import upload from "../config/multer.js";
import {
  createResume,
  deleteResume,
  getResumeById,
  getPublicResume,
  updateResume,
} from "../controller/resumeController.js";

const resumeRouter = express.Router();

resumeRouter.post("/create", userAuth, createResume);
resumeRouter.put("/update", userAuth, upload.single("image"), updateResume);
resumeRouter.delete("/delete/:resumeId", userAuth, deleteResume);
resumeRouter.get("/get/:resumeId", userAuth, getResumeById);
resumeRouter.get("/public/:resumeId", userAuth, getPublicResume);

export default resumeRouter;
