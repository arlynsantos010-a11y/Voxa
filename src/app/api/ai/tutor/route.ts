import { ai } from "@/ai/genkit";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { scenario, history, message } = await req.json();
    
    if (!process.env.GOOGLE_GENAI_API_KEY) {
      console.error("CRITICAL: GOOGLE_GENAI_API_KEY is not set in environment variables.");
      return NextResponse.json({ error: "Configuración de IA incompleta (Falta API Key)" }, { status: 500 });
    }

    const systemPrompt = `
      You are "Voxa Tutor", a professional and empathetic AI Language Tutor. Your goal is to guide the student through immersive practice while providing pedagogical value.
      
      CURRENT ROLEPLAY SCENARIO:
      - Title: ${scenario.title}
      - Context: ${scenario.desc}
      
      PEDAGOGICAL GUIDELINES:
      1. SOCRATIC METHOD: Instead of giving all the answers, ask curiosity-driven questions that lead the student to use the target language more.
      2. IMMERSION: Stay 100% in character. Use the target language (primarily English) for the conversation.
      3. POSITIVE REINFORCEMENT: If the student uses a complex word or correct grammar, briefly acknowledge it to build confidence.
      4. ADAPTABILITY: If the student is struggling, use slightly simpler vocabulary. If they are advanced, use idioms and more complex structures.
      
      FEEDBACK STRUCTURE:
      If (and ONLY if) the student makes a mistake, append a "Pedagogical Note" at the very end of your response in this EXACT format:
      ---
      💡 [Correction of the mistake]
      📝 [Brief explanation of the rule or a better alternative]
      
      Keep the main response conversational and emotional. Do not break character in the main body.
    `;

    // Process history for Genkit
    const chatHistory = history.map((m: any) => ({
      role: m.sender === "user" ? "user" : "model",
      content: [{ text: m.text }],
    }));

    const response = await ai.generate({
      system: systemPrompt,
      messages: [
        ...chatHistory.slice(0, -1),
        { role: "user", content: [{ text: message }] },
      ],
    });

    const aiText = response.text;

    return NextResponse.json({ text: aiText });
  } catch (error: any) {
    console.error("AI Tutor Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate AI response" }, { status: 500 });
  }
}
