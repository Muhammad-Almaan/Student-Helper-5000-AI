// ==========================================================================
// StudyHelper AI: server-side proxy for Groq
//
// The browser sends { systemPrompt, userPrompt, jsonMode } to this function.
// The function adds the secret API key (stored in a Netlify environment
// variable called GROQ_API_KEY, never in the code), calls Groq, and sends
// back only the AI's text as { reply }.
// ==========================================================================

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "openai/gpt-oss-120b";

// Basic limits so nobody can use this function to burn through the quota.
const MAX_SYSTEM_CHARS = 6000;
const MAX_USER_CHARS = 20000;
const MAX_REPLY_TOKENS = 4000;

function respond(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return respond(405, { error: "Method not allowed." });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("GROQ_API_KEY is not set in the Netlify environment variables.");
    return respond(500, { error: "The server is not configured yet." });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (error) {
    return respond(400, { error: "Request body must be valid JSON." });
  }

  const { systemPrompt, userPrompt, jsonMode } = payload;

  if (typeof systemPrompt !== "string" || typeof userPrompt !== "string") {
    return respond(400, { error: "systemPrompt and userPrompt must be text." });
  }
  if (!userPrompt.trim()) {
    return respond(400, { error: "userPrompt cannot be empty." });
  }
  if (systemPrompt.length > MAX_SYSTEM_CHARS || userPrompt.length > MAX_USER_CHARS) {
    return respond(413, { error: "That request is too long." });
  }

  const groqBody = {
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.8,
    max_completion_tokens: MAX_REPLY_TOKENS,
  };

  if (jsonMode === true) {
    groqBody.response_format = { type: "json_object" };
  }

  try {
    const groqResponse = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(groqBody),
    });

    if (!groqResponse.ok) {
      // Details go to the Netlify function log only, never back to the visitor.
      const details = await groqResponse.text();
      console.error(`Groq returned ${groqResponse.status}: ${details}`);
      return respond(groqResponse.status === 429 ? 429 : 502, {
        error: "The AI service could not answer right now.",
      });
    }

    const data = await groqResponse.json();
    const reply =
      data.choices && data.choices[0] && data.choices[0].message
        ? data.choices[0].message.content
        : null;

    if (!reply) {
      return respond(502, { error: "The AI service returned an empty answer." });
    }

    return respond(200, { reply });
  } catch (error) {
    console.error("Could not reach Groq:", error);
    return respond(502, { error: "Could not reach the AI service." });
  }
};