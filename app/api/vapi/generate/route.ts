import { google } from "@ai-sdk/google";
import { generateText } from "ai";

import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

/**
 * Extracts a JSON array of strings from an LLM reply, tolerating markdown
 * code fences and extra prose around the array.
 */
const parseQuestions = (text: string): string[] => {
  const cleaned = text.replace(/```(?:json)?/gi, "").trim();
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start === -1 || end === -1) {
    throw new Error("Model response did not contain a JSON array.");
  }

  const parsed: unknown = JSON.parse(cleaned.slice(start, end + 1));
  if (
    !Array.isArray(parsed) ||
    !parsed.every((q): q is string => typeof q === "string" && q.trim() !== "")
  ) {
    throw new Error("Model response was not an array of strings.");
  }

  return parsed.map((q) => q.trim());
};

const toTechstackArray = (techstack: unknown): string[] => {
  if (Array.isArray(techstack)) return techstack.map(String);
  if (typeof techstack === "string") {
    return techstack
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return [];
};

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { success: false, message: "Request body must be JSON." },
      { status: 400 }
    );
  }

  const { type, role, level, techstack, amount, userid } = body;

  if (!role || !level || !type || !userid) {
    return Response.json(
      {
        success: false,
        message: "Missing required fields: role, level, type and userid.",
      },
      { status: 400 }
    );
  }

  const questionCount = Math.min(Math.max(Number(amount) || 5, 1), 15);
  const techstackArray = toTechstackArray(techstack);

  try {
    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: `Prepare questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstackArray.join(", ") || "not specified"}.
        The focus between behavioural and technical questions should lean towards: ${type}.
        The amount of questions required is: ${questionCount}.
        Please return only the questions, without any additional text.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]`,
    });

    const interview = {
      role: String(role),
      type: String(type),
      level: String(level),
      techstack: techstackArray,
      questions: parseQuestions(text),
      userId: String(userid),
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("interviews").add(interview);

    return Response.json(
      { success: true, interviewId: docRef.id },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Interview generation failed:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred.";

    return Response.json({ success: false, message }, { status: 500 });
  }
}

export async function GET() {
  return Response.json(
    { success: true, message: "Interview generation endpoint is running." },
    { status: 200 }
  );
}
