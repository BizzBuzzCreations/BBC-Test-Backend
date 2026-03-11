require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");

module.exports.geminiAPI = async (question, message) => {
  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.gemini_api_key,
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: `
You are an interviewer evaluating a candidate's response.

Question: "${question}"

Candidate Answer: "${message}"

Evaluate the answer based on:
1. Correctness and relevance to the question
2. Grammar and sentence structure
3. Clarity of explanation

Give a total score out of 10.

Return ONLY valid JSON in this format:

{
  "score": number,
  "feedback": "short explanation of why the score was given"
}
`,
    });
    const cleanText = response.text.replace(/\*\*/g, "");
    return cleanText;
  } catch (error) {
    console.log("Error in geminiAPI:", error);
    const parsed = JSON.parse(error.message.replace("ApiError: ", ""));
    return (
      parsed.error.message || "An error occurred while processing the request."
    );
  }
};
