import mongoose from "mongoose";
import { Schema } from "mongoose";

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
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Indexes
ResumeSchema.index({ userId: 1, title: 1 });
ResumeSchema.index({ public: 1, updatedAt: -1 });

const Resume = mongoose.model("Resume", ResumeSchema);

export default Resume;
