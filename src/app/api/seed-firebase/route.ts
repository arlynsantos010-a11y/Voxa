import { NextResponse } from "next/server";
import { ref, set } from "firebase/database";
import { rtdb } from "@/lib/firebase";

export const dynamic = 'force-dynamic';


export async function GET() {
  const languageLessons = {
    "Francés": [
      { theme: "Viaje a París", word: "Aéroport", sentenceES: "El aeropuerto", sentenceTarget: "L'aéroport", code: "fr-FR", flag: "🇫🇷" },
      { theme: "Restaurante", word: "Manger", sentenceES: "Yo quiero comer", sentenceTarget: "Je veux manger", code: "fr-FR", flag: "🇫🇷" },
      { theme: "Saludos Dificiles", word: "Aujourd'hui", sentenceES: "Hoy es un gran día", sentenceTarget: "Aujourd'hui est un grand jour", code: "fr-FR", flag: "🇫🇷" }
    ],
    "Inglés": [
      { theme: "Cultura Pop", word: "Awesome", sentenceES: "¡Eso es asombroso!", sentenceTarget: "That is awesome!", code: "en-US", flag: "🇺🇸" },
      { theme: "Negocios", word: "Meeting", sentenceES: "La reunión es a las tres", sentenceTarget: "The meeting is at three", code: "en-US", flag: "🇺🇸" },
      { theme: "Diario", word: "Knowledge", sentenceES: "El conocimiento es poder", sentenceTarget: "Knowledge is power", code: "en-US", flag: "🇺🇸" }
    ],
    "Alemán": [
      { theme: "Estudios", word: "Buch", sentenceES: "Yo leo un libro", sentenceTarget: "Ich lese ein Buch", code: "de-DE", flag: "🇩🇪" },
      { theme: "Vida Diaria", word: "Genau", sentenceES: "Exactamente lo que dije", sentenceTarget: "Genau was ich gesagt habe", code: "de-DE", flag: "🇩🇪" }
    ],
    "Italiano": [
      { theme: "Comidas", word: "Delizioso", sentenceES: "La comida es deliciosa", sentenceTarget: "Il cibo è delizioso", code: "it-IT", flag: "🇮🇹" },
      { theme: "Transporte", word: "Macchina", sentenceES: "Me gusta ese coche", sentenceTarget: "Mi piace quella macchina", code: "it-IT", flag: "🇮🇹" }
    ]
  };

  try {
    await set(ref(rtdb, 'lessons'), languageLessons);
    return NextResponse.json({ success: true, message: "Base de datos actualizada a la nueva estructura de arreglos (arrays)." });
  } catch (error) {
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}
