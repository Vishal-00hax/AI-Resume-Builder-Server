import { json } from "express";
import ai from "../config/openai.js";
import Resume from "../config/models/Resume.js";
import "dotenv/config";

// Enhance professional_summary
// Method: POST /api/ai/enhance-pro-sum

export const enhanceProfessionalSummary = async (req, res) => {
  try {
    const { userContent } = req.body;
    if (!userContent || typeof userContent !== "string") {
      return res
        .status(400)
        .json({ message: "Input field is required and cannot be empty." });
    }

    const response = await ai.chat.completions.create({
      model: process.env.OPEN_AI_MODEL || "gemini-1.5-flash",
      messages: [
        {
          role: "system",
          content:
            "You are an expert in resume writing. Your task is to enhance the professional summary of a resume. The summary should be 1-2 sentences also highlighting key skills,experience, and career objectives. Make it compelling and ATS-friendly. And only return text no options or anything else.",
        },
        {
          role: "user",
          content: userContent.trim(),
        },
      ],
      temperature: 0.6, // Keeps the output professional and focused, avoiding hallucinations
    });
    const enhanceResponse = response.choices[0].message.content.trim();
    res.status(200).json({ data: enhanceResponse });
  } catch (err) {
    console.error("[AI Service Error]:", err);

    if (err.status) {
      // API returned an HTTP error (401, 404, 429, etc.)
      const statusCode = err.status || 500;
      const errorMessage =
        err.status === 404
          ? "AI Model or Endpoint not found. Please verify OPEN_AI_MODEL and OPEN_AI_BASE_URL in your .env file."
          : err.message ||
            "An error occurred while communicating with the AI service.";

      return res.status(statusCode).json({
        success: false,
        error: errorMessage,
      });
    }

    // Generic fallback for network errors or unhandled exceptions
    return res.status(500).json({
      message: "Internal Server Error. Please try again later.",
    });
  }
};

// Enhance Job Discription
// Method: POST /api/ai/enhance-job-disc

export const enhanceJobDiscription = async (req, res) => {
  try {
    const { userContent } = req.body;
    if (!userContent || !userContent.trim()) {
      return res
        .status(400)
        .json({ message: "Input field is required and cannot be empty." });
    }
    const response = await ai.chat.completions.create({
      model: process.env.OPEN_AI_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are an expert in resume writing. Your task is to enhance the job discription of a resume. The discription should be 1-2 sentences also highlighting key responsibilities and achievements. Use action verbs and quantifiable results where possible.  Make it compelling and ATS-friendly. And only return text no options or anything else.",
        },
        {
          role: "user",
          content: userContent,
        },
      ],
      temperature: 0.6, // Keeps the output professional and focused, avoiding hallucinations
    });
    const enhanceResponse = response.choices[0].message.content.trim();
    res.status(200).json({ data: enhanceResponse });
  } catch (err) {
    res.status(500).json({ message: err.message });
    console.error("Professional Summary Enhance Error: ", err.message);
  }
};

// Controller for uploading a resume to the database
// POST: /api/ai/upload-resume

export const uploadResume = async (req, res) => {
  try {
    const userId = req.user._id;
    const { resumeText, title } = req.body;
    if (!resumeText || !title) {
      return res
        .status(400)
        .json({ message: "Input field is required and cannot be empty." });
    }
    const response = await ai.chat.completions.create({
      model: process.env.OPEN_AI_MODEL,
      messages: [
        {
          role: "system",
          content: "You are an expert AI Agent to extract data from resume.",
        },
        {
          role: "user",
          content: `extract data from this resume: ${resumeText} 
          Provide data in the following JSON format with no additional text befor or after: 
       const PersonalInfoSchema = new mongoose.Schema({
  image: {
    type: String,
    default: "",
    validate: {
      validator: (v) => !v || /^https?:\/\/.+/.test(v),
      message: "Image must be a valid URL",
    },
  },
  removeBackground: {
    type: Boolean,
    default: false,
  },
  full_name: {
    type: String,
    default: "",
    trim: true,
    maxlength: 40,
  },
  profession: {
    type: String,
    default: "",
    trim: true,
    maxlength: 100,
  },
  email: {
    type: String,
    validate: {
      validator: (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      message: "Email must be a valid email address",
    },
    required: true,
  },
  phone: {
    type: String,
    maxlength: 20,
    default: "",
  },
  location: {
    type: String,
    default: "",
    trim: true,
    maxlength: 100,
  },
  linkedin: {
    type: String,
    trim: true,
  },
  website: {
    type: String,
    trim: true,
    validate: {
      validator: (v) => !v || /^https?:\/\/.+/.test(v),
      message: "Website must be a valid URL",
    },
  },
});

const ExperienceSchema = new mongoose.Schema({
  company: {
    type: String,
    trim: true,
    maxlength: 100,
    default: "",
  },
  position: {
    type: String,
    trim: true,
    maxlength: 100,
    default: "",
  },
  start_date: {
    type: String,
    default: "",
    maxlength: 10,
  },
  end_date: {
    type: String,
    default: "",
    maxlength: 10,
  },
  is_current: {
    type: Boolean,
    default: false,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
    default:
      "Enter a brief description of your role and responsibilities at this position.",
  },
});

const ProjectSchema = new mongoose.Schema({
  title: {
    type: String,
    default: "",
    maxlength: 20,
  },
  technologies: {
    type: [String],
    default: [],
  },
  link: {
    type: String,
    default: "",
    validate: {
      validator: (v) => !v || /^https?:\/\/.+/.test(v),
      message: "Link must be a valid URL",
    },
  },
  description: {
    type: String,
    default: "Add your projects description here.",
    maxlength: 500,
  },
});

const EducationSchema = new mongoose.Schema({
  institution: {
    type: String,
    default: "",
    maxlength: 100,
  },
  degree: {
    type: String,
    default: "",
    maxlength: 100,
  },
  field_of_study: {
    type: String,
    default: "",
    maxlength: 100,
  },
  graduation_date: {
    type: String,
    default: "",
    maxlength: 10,
  },
  gpa: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "Add your education description here.",
    maxlength: 500,
  },
});

// Main Resume Schema

const ResumeSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      default: "My Resume",
    },
    public: {
      type: Boolean,
      default: false,
    },
    template: {
      type: String,
      default: "minimalist",
    },
    accent_color: {
      type: String,
      default: "#06B6D4",
      validate: {
        validator: (v) => /^#[0-9A-Fa-f]{6}$/.test(v),
        message: "Accent color must be a valid hex color (e.g., #3B82F6)",
      },
    },
    professional_summary: {
      type: String,
      trim: true,
      maxlength: 500,
      default:
        "A brief summary of your professional background and career goals.",
    },
    skills: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) =>
          arr.every((s) => typeof s === "string" && s.length > 0),
        message: "Each skill must be a non‑empty string",
      },
    },
    personal_info: {
      type: PersonalInfoSchema,
      required: false,
      default: {},
    },
    experience: {
      type: [ExperienceSchema],
      default: [],
    },
    project: {
      type: [ProjectSchema],
      default: [],
    },
    education: {
      type: [EducationSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);
          `,
        },
      ],
      temperature: 0.1, // Keeps the output professional and focused, avoiding hallucinations
      response_format: { type: "json_object" },
    });
    const enhanceResponse = response.choices[0].message.content.trim();
    let parsedData;
    try {
      parsedData = JSON.parse(enhanceResponse);
    } catch (parseError) {
      console.error("JSON Parse Error from AI output:", enhanceResponse);
      return res.status(522).json({
        error: "AI के रिस्पॉन्स से रेज़्यूमे डेटा पार्स करने में विफल रहा।",
      });
    }
    const newResume = await Resume.create({
      userId: userId,
      title: title,
      ...parsedData,
    });
    res.status(200).json({ resume: newResume._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
    console.error("Professional Summary Enhance Error: ", err.message);
  }
};
