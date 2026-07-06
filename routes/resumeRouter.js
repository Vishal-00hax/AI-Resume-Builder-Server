import express from "express";
import userAuth from "../middelware/authMiddelware.js";
import {
  createResume,
  deleteResume,
  getResumeById,
  getPublicResume,
} from "../controller/resumeController.js";

const resumeRouter = express.Router();

resumeRouter.post("/create", userAuth, createResume);
resumeRouter.delete("/delete/:resumeId", userAuth, deleteResume);
resumeRouter.get("/get/:resumeId", userAuth, getResumeById);
resumeRouter.get("/public/:resumeId", userAuth, getPublicResume);

export default resumeRouter;
