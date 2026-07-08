import OpenAI from "openai";
import "dotenv/config";

const ai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
  baseURL: process.env.OPEN_AI_BASE_URL,
});

export default ai;
