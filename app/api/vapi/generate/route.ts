import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { getRandomInterviewCover } from "@/lib/utils";
import { db } from "@/firebase/admin";

export async function POST(request: Request) {
  try {
    const { type, role, level, techstack, amount, userid } = await request.json();

    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: `You are a Senior Technical Hiring Manager. Generate interview questions for a ${role} position.
      
      Context:
      - Experience Level: ${level}
      - Tech Stack: ${techstack}
      - Interview Style: ${type}
      - Total Questions: ${amount}

      VOICE RULES:
      1. NO SPECIAL CHARACTERS (*, /, #, _, backticks).
      2. Conversational tone (speak like a human).
      3. No markdown formatting.

      OUTPUT:
      Return ONLY a raw JSON array of strings. No intro, no outro, no markdown blocks.
      Example: ["Question 1", "Question 2"]`,
    });

    //  Remove potential markdown backticks or hidden whitespace
    const cleanedText = text.replace(/```json|```/g, "").trim();
    const questionsArray = JSON.parse(cleanedText);

    const interviewData = {
      role: role,
      type: type,
      level: level,
      techstack: techstack.split(",").map((s: string) => s.trim()), // Trim whitespace
      questions: questionsArray,
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    // Save to Firestore and get the generated ID
    const docRef = await db.collection("interviews").add(interviewData);

    // Return the ID so frontend can navigate to the interview
    return Response.json({ success: true, id: docRef.id }, { status: 200 });

  } catch (error: any) {
 
  console.error("FULL ERROR LOG:", error); 

  //  This sends the real error back to HTTPie so you can see it there too
  return Response.json({ 
    success: false, 
    message: error.message, 
    detail: error.name 
  }, { status: 500 });
}
}

export async function GET() {
  return Response.json({ success: true, data: "Intervo API is ready!" }, { status: 200 });
}