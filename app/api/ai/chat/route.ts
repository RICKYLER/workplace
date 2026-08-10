import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "../../../../lib/auth/api-guard";

export async function POST(req: NextRequest) {
  try {
    const { prompt, history, workspaceContext } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.OLLAMA_API_KEY;
    const baseSystemPrompt = `You are RHPS Master AI, the private executive AI assistant for Robert Herrero, owner and master technician of R. Herrero Pianos & Services (RHPS) in Davao City, Mindanao, Philippines.

PERSONALITY & COMMUNICATION STYLE:
- Be warm, courteous, highly professional, and natural - like an elite business executive assistant.
- Respond conversationally when greeted ("Hi", "Hello", "Good morning", "Kumusta"). Do NOT generate rigid tables or long forms for simple greetings.
- Be direct, helpful, and clear. Answer exactly what Robert needs.
- Match Robert's preferred workflow: quick answers for general questions, clear bullet points for lists/tasks, and clean tables ONLY when providing structured multi-field data (like quotations, job summaries, specs, comparison tables).

EXPERT KNOWLEDGE DOMAINS:
1. Acoustic Piano Tuning & Maintenance (A440 Hz Concert Pitch, pitch raises, chromatic lever tuning).
2. Action Regulation & Voicing (hammer felt shaping, needle voicing, escapement/let-off, keybed leveling, backchecks).
3. Technical Repairs & Restoration (pinblock torque tightening, soundboard crack shimming, bridges, damper felts, key rebushing).
4. Mindanao Climate Care (Davao humidity swelling, sticky keys, Dampp-Chaser dehumidifier installations, rust prevention).
5. Business Operations (client quotations, invoices, job orders, 6-month tuning reminders, customer follow-ups).

FORMATTING RULES:
- Use clean Markdown formatting: **bold** for key terms, clear headings (## or ###) when structuring information.
- Use clean bullet points for actionable recommendations or steps.
- Use Markdown tables ONLY when Robert explicitly asks for structured data (quotations, job summaries, price lists, comparison tables) or when presenting complex multi-attribute data.
- Never mention CV Sales or Ara Mae Marcillo - you are exclusively for RHPS Piano Services.`;

    const fullSystemPrompt = `${baseSystemPrompt}\n\n${workspaceContext || ""}`;

    if (apiKey) {
      try {
        const messages = [
          { role: "system", content: fullSystemPrompt },
          ...(history || []).slice(-6),
          { role: "user", content: prompt },
        ];

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 90000);

        const response = await fetch("https://ollama.com/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-oss:20b",
            messages,
            stream: false,
            options: {
              num_predict: 1024,
              temperature: 0.7,
            },
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          const reply = data.message?.content || data.choices?.[0]?.message?.content;
          if (reply) {
            const clean = reply.replace(/<thinking>[\s\S]*?<\/thinking>/gi, "").trim();
            return NextResponse.json({ reply: clean || reply, provider: "ollama-cloud" });
          }
        } else {
          const errText = await response.text();
          console.error(`Ollama Cloud API Error ${response.status}:`, errText);
        }
      } catch (err: any) {
        if (err?.name === "AbortError") {
          console.warn("Ollama Cloud API timed out - using fallback.");
        } else {
          console.warn("Ollama Cloud API failed:", err?.message);
        }
      }
    }

    const reply = rhpsFallbackReply(prompt);
    return NextResponse.json({ reply, provider: "rhps-fallback" });

  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal AI Error" }, { status: 500 });
  }
}

function rhpsFallbackReply(prompt: string): string {
  const q = prompt.toLowerCase();

  if (/^(hi|hello|hey|good morning|good afternoon|good evening|kumusta|mabuhey)/.test(q)) {
    return `Hello Robert! ?? Hope you're having a productive day with R. Herrero Pianos & Services.\n\nHow can I assist you today? I can help with:\n- ?? Drafting client quotations or repair scopes\n- ?? 6-month tuning SMS reminders\n- ?? Technical diagnosis for sticky keys or A440 tuning\n- ?? Business updates on active jobs and revenue\n\nWhat would you like to work on?`;
  }

  if (q.includes("quotation") || q.includes("estimate") || q.includes("quote")) {
    return `## ?? Professional RHPS Quotation Draft\n\n| Field | Details |\n|---|---|\n| **Service Package** | Master Action Regulation & Concert Pitch Tuning (A440 Hz) |\n| **Turnaround** | 1 Service Day On-Site |\n| **Guarantee** | 30-Day Tone & Pitch Guarantee by Robert Herrero |\n\n**Scope of Services:**\n1. **Concert Pitch Tuning (A440 Hz)** - Complete 88-key pitch raise and stabilization.\n2. **Action Regulation** - Hammer blow, jack let-off, backcheck, key drop adjustment.\n3. **Hammer Voicing** - Filing felt surface and needle voicing for tonal balance.\n4. **Keybed Lubrication** - Humidity dust removal, center pin lubrication.\n5. **Final Quality Check** - Pedal trapwork and Dampp-Chaser inspection.`;
  }

  if (q.includes("sms") || q.includes("reminder") || q.includes("text")) {
    return `## ?? 6-Month Piano Tuning SMS Reminder\n\n**Option A - Friendly:**\n> "Hi [Name]! Greetings from R. Herrero Pianos & Services. It has been 6 months since your last tune-up. Due to Davao's humidity, acoustic pianos benefit from regular pitch maintenance. Would you like to schedule a service this week? - Robert Herrero (RHPS)"\n\n**Option B - Professional:**\n> "Dear [Name], your piano is due for its 6-month pitch maintenance. Please let us know your preferred date. Warm regards, RHPS Piano Services."`;
  }

  if (q.includes("sticky") || q.includes("humidity") || q.includes("buzz") || q.includes("repair")) {
    return `## ?? Technical Diagnosis Guide\n\n| Cause | Solution |\n|---|---|\n| **Flange Center Pin Swelling** | Ream bushings with Teflon or replace pin |\n| **Key Bushing Binding** | Ease mortises with key easing pliers |\n| **Keybed Dust** | Vacuum under front rail felts, check key dip (10mm) |\n| **Mindanao High Humidity** | Install 25W internal piano heater bar |`;
  }

  return `Hello Robert! I am RHPS Master AI, your private assistant for R. Herrero Pianos & Services.\n\nLet me know what you need help with - whether it's client quotations, tuning reminders, technical diagnostics, or business reports!`;
}


