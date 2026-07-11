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
      max_tokens: 1000, // Prevents the AI from rambling beyond 1-2 sentences
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
      max_tokens: 1000, // Prevents the AI from rambling beyond 1-2 sentences
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
          {
  "professional_summary": "", // String (Maximum 200 characters)
  "skills": [], // Array of Strings
  "personal_info": {
    "image": "", // String (Valid URL or leave empty)
    "full_name": "", // String (Maximum 40 characters)
    "profession": "", // String (Maximum 100 characters)
    "email": "", // String (Must be a valid email format)
    "phone": "", // String (Maximum 20 characters)
    "location": "", // String (Maximum 100 characters)
    "linkedin": "", // String
    "website": "" // String (Valid URL or leave empty)
  },
  "experience": [
    {
      "company": "", // String (Maximum 100 characters)
      "position": "", // String (Maximum 100 characters)
      "start_date": "", // String (Maximum 10 characters, e.g., "YYYY-MM", "YYYY")
      "end_date": "", // String (Maximum 10 characters, e.g., "YYYY-MM", or empty if current)
      "is_current": false, // Boolean (true if currently working here)
      "description": "" // String (Maximum 500 characters)
    }
  ],
  "project": [
    {
      "title": "", // String (Maximum 20 characters - abbreviate if needed)
      "technologies": [], // Array of Strings
      "link": "", // String (Valid URL or leave empty)
      "description": "" // String (Maximum 500 characters)
    }
  ],
  "education": [
    {
      "institution": "", // String (Maximum 100 characters)
      "degree": "", // String (Maximum 100 characters)
      "field_of_study": "", // String (Maximum 100 characters)
      "graduation_date": "", // String (Maximum 10 characters)
      "gpa": "", // String
      "description": "" // String (Maximum 500 characters)
    }
  ]
}
          `,
        },
      ],
      temperature: 0.1, // Keeps the output professional and focused, avoiding hallucinations
      max_tokens: 3000, // Prevents the AI from rambling beyond 1-2 sentences
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
