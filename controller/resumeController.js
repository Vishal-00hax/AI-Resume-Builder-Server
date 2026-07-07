import Resume from "../config/models/Resume.js";
import mongoose from "mongoose";
import imagekit from "../config/imagekit.js";
import fs from "fs";

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
      return res.status(400).json({
        error: "Title is required",
      });
    }

    const newResume = await Resume.create({
      userId,
      title,
      // Optional fields (only include if provided)
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
      return res.status(400).json({
        error: "Resume Id is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
      return res.status(400).json({
        error: "Invalid Resume ID format",
      });
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
      return res.status(400).json({
        error: "Resume Id is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
      return res.status(400).json({
        error: "Invalid Resume ID format",
      });
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

    res.status(200).json({
      success: true,
      resume: resume,
    });
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
    const resume = await Resume.find({ public: true, _id: resumeId }).select(
      "-__v -createdAt -updatedAt",
    );
    res.status(200).json({ success: true, resume: resume });
  } catch (err) {
    console.error("Get Resume by public Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update Resume /api/resume/update
export const updateResume = async (req, res) => {
  try {
    const userId = req.user._id;
    const { resumeId, resumeData, removeBackground } = req.body;
    const image = req.file;

    // 1. Validate Resume ID
    if (!resumeId || !mongoose.Types.ObjectId.isValid(resumeId)) {
      return res.status(400).json({ error: "Valid Resume ID is required" });
    }

    // 2. Parse resumeData safely
    let copyResumeData;
    try {
      copyResumeData =
        typeof resumeData === "string" ? JSON.parse(resumeData) : resumeData;
    } catch (parseError) {
      return res
        .status(400)
        .json({ error: "Invalid JSON format in resumeData" });
    }

    if (!copyResumeData || typeof copyResumeData !== "object") {
      return res
        .status(400)
        .json({ error: "Resume data is required and must be an object" });
    }

    // 3. Handle Image Upload to ImageKit
    if (image) {
      // Convert RAM buffer to Base64 string for 100% reliable network transmission
      const filePayload = image.buffer
        ? image.buffer.toString("base64")
        : fs.createReadStream(image.path);

      const response = await imagekit.files.upload({
        file: filePayload,
        fileName: `resume-${userId}-${Date.now()}.png`,
        folder: "user-resume",
        transformation: {
          pre: `w-300,h-300,fo-face,z-0.75${removeBackground === "true" || removeBackground === true ? ",e-bgremove" : ""}`,
        },
      });

      console.log("ImageKit Upload URL:", response.url);

      // FIXED: Safely attach image URL without overwriting existing personal_info data in MongoDB
      if (
        copyResumeData.personal_info &&
        typeof copyResumeData.personal_info === "object"
      ) {
        copyResumeData.personal_info.image = response.url;
      } else {
        copyResumeData["personal_info.image"] = response.url;
      }

      // Only unlink if disk storage was accidentally used (fallback cleanup)
      if (image.path) {
        fs.unlink(image.path, (err) => {
          if (err) console.error("Failed to delete temp file:", err);
        });
      }
    }

    // 4. Update MongoDB using $set to guarantee clean partial updates
    const resume = await Resume.findOneAndUpdate(
      { userId, _id: resumeId },
      { $set: copyResumeData },
      { returnDocument: "after", runValidators: true },
    );

    if (!resume) {
      return res
        .status(404)
        .json({ error: "Resume not found or unauthorized" });
    }

    res.status(200).json({ success: true, resume: resume });
  } catch (err) {
    console.error("Update Resume Error:", err);
    res.status(500).json({ error: "Internal server error: " + err.message });
  }
};
