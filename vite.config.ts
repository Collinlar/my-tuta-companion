import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import type { IncomingMessage, ServerResponse } from "http";

async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

function groqDevProxy(apiKey: string) {
  return {
    name: "groq-dev-api",
    configureServer(server: { middlewares: { use: Function } }) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        if (!req.url?.startsWith("/api/groq")) return next();
        if (req.method === "OPTIONS") {
          res.statusCode = 204;
          res.end();
          return;
        }
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }
        if (!apiKey) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "GROQ_API_KEY is not set in your .env file" }));
          return;
        }
        try {
          const raw = await readBody(req);
          const body = JSON.parse(raw || "{}") as {
            messages?: unknown;
            model?: string;
            max_tokens?: number;
            temperature?: number;
          };
          if (!body.messages || !body.model) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "messages and model are required" }));
            return;
          }
          const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: body.model,
              messages: body.messages,
              max_tokens: body.max_tokens,
              temperature: body.temperature ?? 0.7,
            }),
          });
          const data = await response.text();
          res.statusCode = response.status;
          res.setHeader("Content-Type", "application/json");
          res.end(data);
        } catch (err) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({
            error: err instanceof Error ? err.message : "Groq proxy failed",
          }));
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Prefer server-only GROQ_API_KEY. Accept VITE_GROQ_API_KEY only as a
  // migration convenience if someone followed an older .env example.
  const groqKey = env.GROQ_API_KEY || env.VITE_GROQ_API_KEY || "";
  return {
    server: {
      host: "::",
      port: 5000,
    },
    plugins: [
      react(),
      groqDevProxy(groqKey),
      mode === "development" && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["./src/test-setup.ts"],
    },
  };
});
