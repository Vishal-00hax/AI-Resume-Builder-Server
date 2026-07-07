import ai from "../config/openai.js";

// Enhance professional_summary
// Method: POST /api/ai/enhance-pro-sum

export const enhanceProfessionalSummary = async (req, res) => {
  try {
    const { userContent } = req.body;
    if (!userContent || !userContent.trim()) {
      return res
        .status(400)
        .json({ message: "Input field is required and cannot be empty." });
    }
    const response = await ai.chat.completions.create({
      model: process.env.OPEN_AI_MODEL || "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are an expert in resume writing. Your task is to enhance the professional summary of a resume. The summary should be 1-2 sentences also highlighting key skills,experience, and career objectives. Make it compelling and ATS-friendly. And only return text no options or anything else.",
        },
        {
          role: "user",
          content: userContent,
        },
      ],
      temperature: 0.6, // Keeps the output professional and focused, avoiding hallucinations
      max_tokens: 150, // Prevents the AI from rambling beyond 1-2 sentences
    });
    const enhanceResponse = response.choices[0].message.content.trim();
    res.status(200).json({ data: enhanceResponse });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.error("Professional Summary Enhance Error: ", err.message);
  }
};
