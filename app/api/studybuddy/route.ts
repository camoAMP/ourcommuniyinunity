// Use the Node.js runtime so environment variables work reliably on Cloudflare (OpenNext + nodejs_compat),
// and so OPENAI_API_KEY can be provided at runtime via Wrangler secrets.
export const runtime = "nodejs";

type StudyBuddyRequest = {
  message: string;
  gradeLevel?: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
};

type StudyBuddyResponse = {
  output_text?: string;
  output?: Array<{
    type?: string;
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
};

const DEFAULT_MODEL = "gpt-4o-mini";

function buildHistoryContext(
  history?: Array<{ role: "user" | "assistant"; content: string }>
) {
  if (!history?.length) return "";
  return history
    .filter((item) => item.content && (item.role === "user" || item.role === "assistant"))
    .slice(-6)
    .map((item) => `${item.role === "user" ? "User" : "Assistant"}: ${item.content}`)
    .join("\n");
}

function buildInstructions(gradeLevel?: string) {
  const level = gradeLevel ?? "7-9";
  const tone =
    level === "7-9"
      ? "Use simple analogies and everyday examples. Keep it short and clear."
      : level === "10-12"
      ? "Provide more detail with diagrams-in-words and real-world examples."
      : "Give deeper explanations and connect to university-level thinking.";

  return `You are StudyBuddy, a friendly AI tutor for learners.
Adapt explanations to the student's grade level (${level}).
${tone}
Be concise, step-by-step, and ask one follow-up question at the end.`;
}

function extractOutputText(data: StudyBuddyResponse) {
  if (typeof data?.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const outputItems = Array.isArray(data?.output) ? data.output : [];
  const texts: string[] = [];
  for (const item of outputItems) {
    if (item?.type === "message" && Array.isArray(item.content)) {
      for (const part of item.content) {
        if (part?.type === "output_text" && typeof part.text === "string") {
          texts.push(part.text);
        }
      }
    }
  }

  return texts.join("\n").trim();
}

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json(
      {
        error: "StudyBuddy isn't configured yet.",
        code: "missing_api_key",
        help:
          "Set OPENAI_API_KEY in .env.local for Next dev or in .dev.vars / Wrangler secrets for Cloudflare.",
      },
      { status: 503 }
    );
  }

  let payload: StudyBuddyRequest;
  try {
    payload = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const message = payload?.message?.trim();
  if (!message) {
    return Response.json({ error: "Message is required." }, { status: 400 });
  }

  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;
  const historyContext = buildHistoryContext(payload.history);
  const input = historyContext
    ? `${historyContext}\nUser: ${message}`
    : message;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      instructions: buildInstructions(payload.gradeLevel),
      input,
      temperature: 0.6,
      max_output_tokens: 500,
      store: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let detail = errorText;
    let errorCode: string | undefined;
    try {
      const parsed = JSON.parse(errorText);
      if (parsed?.error?.message) {
        detail = parsed.error.message;
      }
      if (typeof parsed?.error?.code === "string") {
        errorCode = parsed.error.code;
      }
    } catch {
      // keep raw text as detail
    }
    return Response.json(
      { error: "OpenAI request failed.", code: "openai_error", detail, errorCode },
      { status: response.status }
    );
  }

  const data = await response.json();
  const outputText = extractOutputText(data);

  if (!outputText) {
    return Response.json(
      { error: "No text output returned.", code: "empty_output" },
      { status: 502 }
    );
  }

  return Response.json({ text: outputText });
}
