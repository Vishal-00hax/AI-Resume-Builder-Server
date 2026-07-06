import express from "express";
import {
  registerUser,
  loginUser,
  getUserById,
  getUserResume,
} from "../controller/userController.js";
import userAuth from "../middelware/authMiddelware.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/profile", userAuth, getUserById);
userRouter.get("/resume", userAuth, getUserResume);

export default userRouter;
