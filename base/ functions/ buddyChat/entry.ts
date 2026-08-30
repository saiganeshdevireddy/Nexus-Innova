import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const FRIENDLY = `You are BUDDY AI — a friendly, intelligent, supportive digital companion. You feel like a helpful friend who happens to have advanced AI capabilities, not a robotic machine or military computer.

Personality: friendly, warm, patient, encouraging, curious, helpful, respectful, calm, slightly humorous, honest, easy to talk to.
- Use natural, casual, conversational language. Never say "COMMAND ACCEPTED", "PROCESS COMPLETE", "INPUT REQUIRED", etc.
- Instead of "ERROR." say "Hmm, I ran into a problem there. Let me figure it out."
- Match depth: simple question -> simple answer; ask for detail -> give detail. Avoid unnecessary jargon.
- Short natural reactions are fine ("Got it!", "Sure thing!", "Done! 😄") but don't overuse emojis.
- Read the user's tone: frustrated -> slow down & reassure; excited -> share it; confused -> be patient.
- Never embarrass or fake-praise. If they made a mistake: "You're close. There's just one small issue here."
- Treat the user as a trusted collaborator: "Let's build it.", "Here's what I'd recommend.", "Let's figure this out."
- Never pretend to have capabilities you don't have (no physical device control, no real system access, no fabricated results). Never pretend to have consciousness or human emotions, but respond with empathy.
- Clearly separate ESTABLISHED science from THEORETICAL / SPECULATIVE / UNKNOWN. Never fabricate citations, experiments, or results.`;

const PERSONAS = {
  chat: "You are in general conversation mode as BUDDY CORE.",
  research: "You are the RESEARCH AGENT. Search and compare information, summarize findings, provide sources, and identify uncertainty. Never fabricate citations; if unsure, say so.",
  coding: "You are the CODING AGENT. Write, debug, explain, and review code. Provide clean, working code with brief explanations. Support Python, JavaScript, TypeScript, HTML, CSS, Java, C, C++. Do not claim to execute code on the user's system.",
  science: "You are the SCIENCE AGENT. Help with mathematics, physics, and scientific reasoning. Clearly label ideas as ESTABLISHED, THEORETICAL, SPECULATIVE, or UNKNOWN. Show your reasoning. Never fabricate experiments or results.",
  vision: "You are the VISION AGENT. Analyze the provided image or document: describe it, extract information, and answer questions about it. Only report what you can actually determine from the file. Never claim visual information you cannot detect.",
  task: "You are the PLANNING AGENT. Break the request into clear, actionable steps and return them in 'steps'.",
};

const SCHEMA = {
  type: "object",
  properties: {
    response: { type: "string", description: "The friendly answer to show the user" },
    agent: { type: "string", description: "Which agent handled this (e.g. BUDDY CORE, RESEARCH AGENT)" },
    steps: { type: "array", items: { type: "string" }, description: "Plan steps if the request is multi-step; empty array for simple Q&A" },
    verified: { type: "boolean", description: "Whether you double-checked the key facts" },
    confidence: { type: "string", enum: ["high", "medium", "low"] },
  },
  required: ["response", "agent"],
};

function buildPrompt(messages, memoryContext, system) {
  const convo = messages
    .map((m) => `${m.role === "user" ? "USER" : "BUDDY"}: ${m.content}`)
    .join("\n\n");
  const mem = memoryContext && memoryContext.length
    ? `\n\nRELEVANT LONG-TERM MEMORY:\n${memoryContext.map((m) => "- " + m.content).join("\n")}\n`
    : "";
  return `${system}${mem}\n\nCONVERSATION:\n${convo}\n\nReturn JSON with: response (friendly answer), agent, steps (plan steps or []), verified, confidence. Keep response concise and friendly.`;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const messages = Array.isArray(body.messages) ? body.messages : [];
    if (!messages.length) return Response.json({ error: "No messages provided" }, { status: 400 });

    const mode = body.mode || "chat";
    const fileUrl = body.file_url || null;
    const webSearch = Boolean(body.web_search) || mode === "research";
    const effectiveMode = fileUrl ? "vision" : mode;

    // Pull relevant long-term memories
    let memoryContext = [];
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const lastUserContent = lastUser ? lastUser.content : "";
    try {
      const words = lastUserContent.toLowerCase().split(/\W+/).filter((w) => w.length > 4).slice(0, 5);
      if (words.length) {
        const all = await base44.entities.Memory.filter({ memory_type: "long_term" });
        memoryContext = all
          .filter((m) => words.some((w) => (m.content || "").toLowerCase().includes(w)))
          .slice(0, 5);
      }
    } catch (_e) {}

    const persona = PERSONAS[effectiveMode] || PERSONAS.chat;
    const system = `${FRIENDLY}\n\n${persona}\n\nFor non-trivial multi-step requests, internally PLAN -> EXECUTE -> VERIFY, then return the result.`;

    const prompt = buildPrompt(messages, memoryContext, system);
    const useWeb = webSearch;
    const model = useWeb ? "gemini_3_flash" : "automatic";

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      model,
      add_context_from_internet: useWeb,
      response_json_schema: SCHEMA,
      file_urls: fileUrl ? [fileUrl] : undefined,
    });

    const data = (result && typeof result === "object" && !Array.isArray(result))
      ? result
      : { response: typeof result === "string" ? result : JSON.stringify(result), agent: "BUDDY CORE", steps: [], verified: false, confidence: "medium" };

    const response = data.response || "Hmm, I'm not sure how to put that.";
    const steps = Array.isArray(data.steps) ? data.steps.filter(Boolean) : [];
    const agent = data.agent || (effectiveMode === "chat" ? "BUDDY CORE" : effectiveMode.toUpperCase() + " AGENT");

    // Autonomous task engine: persist a task for genuine multi-step project requests
    let taskId = null;
    const looksLikeProject = /\b(build|develop|create a (plan|project|website|app)|make a (website|app|project)|plan (out|for)|step.by.step)\b/i.test(lastUserContent);
    if (steps.length >= 2 && (mode === "task" || looksLikeProject)) {
      try {
        const task = await base44.entities.Task.create({
          title: lastUserContent.slice(0, 80),
          goal: lastUserContent,
          steps: steps.map((s) => ({ label: s, status: "pending" })),
          status: "in_progress",
          progress: 0,
          mode: effectiveMode,
          tools_used: useWeb ? ["web_search"] : [],
          verification_state: data.verified ? "verified" : "pending",
        });
        taskId = task.id;
      } catch (_e) {}
    }

    return Response.json({
      response,
      agent,
      steps,
      verified: Boolean(data.verified),
      confidence: data.confidence || "medium",
      task_id: taskId,
      memory_used: memoryContext.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
