import type { Handler, HandlerEvent } from "@netlify/functions";

const handler: Handler = async (event: HandlerEvent) => {
  // GET /models — list models available to this key
  if (event.httpMethod === "GET") {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return { statusCode: 500, body: JSON.stringify({ error: "No key" }) };
    const r = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const d = await r.json();
    return { statusCode: r.status, headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: "Groq API key not configured on server" }) };
  }

  let body: { messages?: unknown; model?: string; max_tokens?: number; temperature?: number };
  try {
    body = JSON.parse(event.body ?? "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  const { messages, model, max_tokens, temperature } = body;

  if (!messages || !model) {
    return { statusCode: 400, body: JSON.stringify({ error: "messages and model are required" }) };
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, messages, max_tokens, temperature: temperature ?? 0.7 }),
  });

  const data = await response.json();

  return {
    statusCode: response.status,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
};

export { handler };
