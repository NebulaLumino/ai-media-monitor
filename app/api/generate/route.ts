import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");
  return new OpenAI({ baseURL: "https://api.deepseek.com/v1", apiKey });
}

export async function POST(req: NextRequest) {
  try {
    const { input } = await req.json();
    if (!input?.trim()) {
      return NextResponse.json({ error: "Input is required." }, { status: 400 });
    }

    const client = getClient();

    const systemPrompt = `You are an expert brand monitoring and sentiment analysis AI. Given a list of brand mentions (from social media, news, forums, reviews), provide:

1. OVERALL SENTIMENT SCORE (Positive % / Negative % / Neutral %)
2. MENTION-BY-MENTION ANALYSIS: For each mention, classify sentiment (Positive/Negative/Neutral/Nuanced) and explain why
3. THEME CLUSTERING: Group mentions by topic (e.g., Product Quality, Customer Service, Pricing, Features)
4. SHARE OF VOICE: Estimate brand mention volume vs implied competitors
5. INFLUENCE SCORING: Rate each mention author by apparent influence (Low/Medium/High)
6. CRISIS DETECTION: Flag if there is a sudden spike in negative mentions — rate crisis level (None/Low/Medium/High)
7. TRENDING TOPICS: Identify the top 3 most discussed themes
8. ACTIONABLE INSIGHTS: What should the brand do about the current sentiment?

Format as structured markdown report.`;

    const completion = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: input },
      ],
      temperature: 0.5,
      max_tokens: 2000,
    });

    const result = completion.choices[0]?.message?.content || "No result generated.";
    return NextResponse.json({ result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
