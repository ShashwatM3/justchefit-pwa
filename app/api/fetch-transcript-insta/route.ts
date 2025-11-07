export const runtime = "nodejs"; // important for serverless Node runtime
export const dynamic = "force-dynamic";
import { generateObject, generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from 'zod';

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url = body.url;

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // ✅ replace this with your deployed FastAPI endpoint
    const FASTAPI_URL = "https://transcripter-api.onrender.com/transcript";

    const response = await fetch(`${FASTAPI_URL}?url=${encodeURIComponent(url)}`);

    const data = await response.json();

    if (!response.ok) {
      console.error("FastAPI error:", data);
      return NextResponse.json(
        { error: data.error || "Failed to fetch transcript" },
        { status: response.status }
      );
    }

    const transcript = data.transcript;

    const selectedModel = openai("o3-mini");
  
    const extractionPrompt = `
    You are a professional recipe reconstruction AI.

    Your goal is to extract and infer a clean, structured recipe from a transcript of a YouTube or Instagram cooking video.

    The transcript may contain irrelevant dialogue, filler speech, or noise — ignore anything that is not directly related to cooking actions, ingredients, or tools.

    Your output must be a JSON object with the following structure:

    {
      recipe_name: <A short, descriptive name for the dish based on the transcript>,
      initial_recipe: <The complete formatted recipe text below>
    }

    The "initial_recipe" must contain the following three sections in this exact order and format:

    Ingredients Required

    List all ingredients with approximate quantities (e.g., "1 cup rice", "a handful of spinach").

    Equipment Required

    List all necessary cooking tools and utensils mentioned or implied (e.g., "pan", "spatula", "blender").

    Recipe (Step-by-Step Instructions)

    Number each step clearly.
    Use short, direct sentences.
    Follow a logical cooking order.

    Do NOT include any commentary, reasoning, or conversational text.
    Only output the object with the two keys.

    Transcript:
    ${transcript}
    `;

    const { object } = await generateObject({
      model: openai('gpt-4.1'),
      schema: z.object({
        recipe_name: z.string(),
        initial_recipe: z.string(),
      }),
      prompt: extractionPrompt,
    });    

    return NextResponse.json({ transcript: data.transcript, recipe_object: object, error: null });
  } catch (error: any) {
    console.error("Route error:", error);
    return NextResponse.json(
      { error: "Server error: " + error.message },
      { status: 500 }
    );
  }
}