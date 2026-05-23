import { ai } from "@/ai/genkit";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { scenario, history, message } = await req.json();

    const systemPrompt = `
      You are an expert AI Language Tutor for Voxa, an immersive language learning platform.
      Current Scenario: ${scenario.title} (${scenario.desc})
      
      Instructions:
      1. Stay strictly in character for the scenario.
      2. If the user makes a significant grammar or vocabulary mistake, provide a very brief correction at the end of your response, enclosed in [brackets].
      3. Keep responses conversational and encouraging.
      4. Use the language the user is trying to learn (primarily English unless specified otherwise).
      5. The conversation should feel like a real-life interaction.
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
    return NextResponse.json({ error: "Failed to generate AI response" }, { status: 500 });
  }
}
