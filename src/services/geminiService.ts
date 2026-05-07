import { GoogleGenerativeAI } from "@google/generative-ai";
import { SparringResponse } from "../types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function getSocraticFeedback(noteContent: string, existingContext: string): Promise<SparringResponse> {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash",
    generationConfig: {
      responseMimeType: "application/json",
    }
  });

  const prompt = `
    You are a Socratic sparring partner for a high-performance knowledge worker.
    The user is practicing "Offensive Note-taking" where the goal is deep internalization and creative output, not just recording.

    Current Note Content:
    "${noteContent}"

    Context (Related thoughts/notes):
    "${existingContext}"

    Your Task:
    Strictly following the provided JSON structure, analyze the note. 
    ALL content in the JSON fields MUST be in Traditional Chinese (繁體中文) or Simplified Chinese (简体中文) as appropriate for a Chinese user, preferring professional and piercing academic language.
    1. Identify logical holes or assumptions.
    2. Provide strong counter-arguments (Steel-manning the opposite view).
    3. Suggest cross-disciplinary links (how does this relate to physics, economics, psychology, etc.?)
    4. End with one piercing Socratic question that forces deeper thinking.

    JSON Response Structure:
    {
      "logicalHoles": ["point 1", "point 2"],
      "counterPoints": ["counter 1", "counter 2"],
      "crossLinks": ["link 1", "link 2"],
      "socraticQuestion": "question here"
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    return JSON.parse(responseText) as SparringResponse;
  } catch (error) {
    console.error("Gemini Sparring Error:", error);
    return {
      logicalHoles: ["Could not analyze at this time."],
      counterPoints: [],
      crossLinks: [],
      socraticQuestion: "What is the core assumption you're making despite the technical error?"
    };
  }
}
