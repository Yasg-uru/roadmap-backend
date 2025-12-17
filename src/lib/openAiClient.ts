
import { OpenAI } from "openai";

// Use environment variable for API key. DO NOT commit secrets to the repository.
const apiKey = process.env.OPENAI_API_KEY;

export const openai = new OpenAI({
  apiKey
});
