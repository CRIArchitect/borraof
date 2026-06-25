import Groq from "groq-sdk";

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  console.error("[Borrão] GROQ_API_KEY ausente.");
}

export const groq = new Groq({ apiKey });

export const GROQ_MODEL = "llama-3.3-70b-versatile";
