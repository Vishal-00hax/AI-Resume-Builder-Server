import User from "../config/models/User.js";
import bcrypt from "bcrypt";

export const registerUser = async (req, res) => {
  try {
    const { name, emailId, password } = req.body;
    // check if required fields are present
    if (!name || !emailId || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    // check if the user is already present
    const user = await User.findOne({ emailId });
    if (user) {
      return res.status(400).json({ error: "User is alredy exists." });
    }
    // create user
    const hassedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      emailId,
      password: hassedPassword,
    });

    const token = newUser.getJWT();
    newUser.password = undefined;

    res
      .status(201)
      .json({ message: "User Created Sucessfully", token, user: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { emailId, password } = req.body;
    // check if required fields are present
    if (!emailId || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    // check if the user is already present
    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const validPassworrd = user.comparePassword(password);
    if (!validPassworrd) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const token = user.getJWT();
    user.password = undefined;

    res
      .status(200)
      .json({ message: "User logged in successfully", token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const userId = req.user._id;

    // check if the user is already present
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.password = undefined;

    res.status(200).json({ data: user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
