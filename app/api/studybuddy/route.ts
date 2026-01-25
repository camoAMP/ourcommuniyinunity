export const runtime = "edge";

type StudyBuddyRequest = {
  message: string;
  gradeLevel?: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
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

function extractOutputText(data: any) {
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
      { error: "Missing OPENAI_API_KEY." },
      { status: 500 }
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
    return Response.json(
      { error: "OpenAI request failed.", detail: errorText },
      { status: response.status }
    );
  }

  const data = await response.json();
  const outputText = extractOutputText(data);

  if (!outputText) {
    return Response.json(
      { error: "No text output returned." },
      { status: 502 }
    );
  }

  return Response.json({ text: outputText });
}
