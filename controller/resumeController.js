import Resume from "../config/models/Resume.js";
import mongoose from "mongoose";
import imagekit from "../config/imagekit.js";
import fs from "fs";

// Helper to prevent data-wiping in MongoDB
const toDotNotation = (obj, prefix = "") => {
  return Object.entries(obj).reduce((acc, [key, val]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (val && typeof val === "object" && !Array.isArray(val)) {
      Object.assign(acc, toDotNotation(val, path));
    } else {
      acc[path] = val;
    }
    return acc;
  }, {});
};

// api/resume/create
export const createResume = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      title,
      personal_info,
      template,
      accent_color,
      public: isPublic,
      professional_summary,
      skills,
      experience,
      project,
      education,
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const newResume = await Resume.create({
      userId,
      title,
      ...(personal_info && { personal_info }),
      ...(template && { template }),
      ...(accent_color && { accent_color }),
      public: isPublic || false,
      professional_summary: professional_summary || "",
      skills: skills || [],
      experience: experience || [],
      project: project || [],
      education: education || [],
    });
    res.status(201).json({
      success: true,
      message: "Resume created successfully",
      resume: newResume,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete Resume /api/resume/delete/:resumeId
export const deleteResume = async (req, res) => {
  try {
    const userId = req.user._id;
    const { resumeId } = req.params;

    if (!resumeId) {
      return res.status(400).json({ error: "Resume Id is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
      return res.status(400).json({ error: "Invalid Resume ID format" });
    }

    const deletedResume = await Resume.findOneAndDelete({
      userId,
      _id: resumeId,
    });

    if (!deletedResume) {
      return res.status(404).json({
        error: "Resume not found or you are not authorized to delete it",
      });
    }

    res.status(200).json({
      success: true,
      message: "Resume deleted successfully",
    });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ error: "Invalid Resume ID format" });
    }
    console.error("Delete Resume Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get resume by id /api/resume/get/:resumeId
export const getResumeById = async (req, res) => {
  try {
    const userId = req.user._id;
    const { resumeId } = req.params;

    if (!resumeId) {
      return res.status(400).json({ error: "Resume Id is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
      return res.status(400).json({ error: "Invalid Resume ID format" });
    }

    const resume = await Resume.findOne({
      userId,
      _id: resumeId,
    }).select("-createdAt -updatedAt");

    if (!resume) {
      return res.status(404).json({
        error: "Resume not found or you are not authorized to get it",
      });
    }

    res.status(200).json({ success: true, resume: resume });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ error: "Invalid Resume ID format" });
    }
    console.error("Get Resume by id Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get Resume by public: true,  /api/resume/public/:resumeId
export const getPublicResume = async (req, res) => {
  try {
    const { resumeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
      return res.status(400).json({ error: "Invalid Resume ID format" });
    }

    // FIXED: Changed .find() to .findOne() so frontend gets an Object, not an Array!
    const resume = await Resume.findOne({ public: true, _id: resumeId }).select(
      "-__v -createdAt -updatedAt",
    );

    if (!resume) {
      return res.status(404).json({ error: "Public resume not found" });
    }

    res.status(200).json({ success: true, resume: resume });
  } catch (err) {
    console.error("Get Resume by public Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// PATCH Update Resume /api/resume/update
export const updateResume = async (req, res) => {
  try {
    const userId = req.user._id;
    const { resumeId, resumeData, removeBackground } = req.body;
    const image = req.file;

    let parsedData = {};
    if (resumeData) {
      try {
        parsedData =
          typeof resumeData === "string" ? JSON.parse(resumeData) : resumeData;
      } catch (parseError) {
        return res
          .status(400)
          .json({ error: "Invalid JSON format in resumeData" });
      }
    }

    const shouldRemoveBg =
      removeBackground === "true" || removeBackground === true ? true : false;
    parsedData["personal_info.removeBackground"] = shouldRemoveBg;

    if (image) {
      // Using diskStorage, image.buffer is undefined. It correctly falls back to createReadStream.
      const filePayload = image.buffer
        ? image.buffer.toString("base64")
        : fs.createReadStream(image.path);

      const response = await imagekit.files.upload({
        file: filePayload,
        fileName: `resume-${userId}-${Date.now()}.png`,
        // IMPROVEMENT: Dynamically organize ImageKit folders by User ID!
        folder: `user-resumes/${userId}`,
        transformation: {
          pre: `w-300,h-300,fo-face,z-0.75,f-png${
            shouldRemoveBg ? ",e-bgremove" : ""
          }`,
        },
      });

      // Safely attach to parsed data using dot notation
      parsedData["personal_info.image"] = response.url;

      // Clean up the temp disk file
      if (image.path) {
        fs.unlink(image.path, (err) => {
          if (err) console.error("Failed to delete temp file:", err);
        });
      }
    }

    // Convert everything to dot-notation so ONLY provided fields update!
    const safeUpdatePayload = toDotNotation(parsedData);

    if (Object.keys(safeUpdatePayload).length === 0) {
      return res
        .status(400)
        .json({ message: "No valid fields provided for update" });
    }

    const resume = await Resume.findOneAndUpdate(
      { userId, _id: resumeId },
      { $set: safeUpdatePayload },
      { returnDocument: "after", runValidators: true },
    );

    if (!resume) {
      return res
        .status(404)
        .json({ message: "Resume not found or unauthorized" });
    }

    res.status(200).json({ success: true, resume: resume });
  } catch (err) {
    console.error("Update Resume Error:", err);
    res.status(500).json({ message: "Internal server error: " + err.message });
  }
};
