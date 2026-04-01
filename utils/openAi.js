require("dotenv").config();

module.exports.getOpenAIApiRes = async (question, answer, topic) => {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `
You are an interviewer evaluating a candidate’s response. Be slightly lenient.

${topic ? topic : ""}

Question: "${question}"

Candidate Answer: "${answer}"

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
        },
      ],
    }),
  };
  try {
    const res = await fetch(
      "https://api.openai.com/v1/chat/completions",
      options,
    );
    const response = await res.json();
    return JSON.parse(response.choices[0].message.content);
  } catch (err) {
    console.log(err);
  }
};
