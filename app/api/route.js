import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export const POST = async (req) => {
  const body = await req.json();
  console.log("body:", body);
  const prompt = "summarize the following extracted texts: " + body.text;
  const result = await model.generateContent(prompt);
  const summary = result.response.text();
  return NextResponse.json({
    success: true,
    message: "Text summarized successfully",
    summary: summary,
  });
};
