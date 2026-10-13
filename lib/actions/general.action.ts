"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { feedbackSchema, FEEDBACK_CATEGORIES } from "@/constants";

const toInterview = (
  doc:
    | FirebaseFirestore.QueryDocumentSnapshot
    | FirebaseFirestore.DocumentSnapshot
) => ({ id: doc.id, ...doc.data() }) as Interview;

/**
 * All interviews created by this user, newest first.
 * Sorting is done in memory so no Firestore composite index is required.
 */
export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[]> {
  try {
    const snapshot = await db
      .collection("interviews")
      .where("userId", "==", userId)
      .get();

    return snapshot.docs
      .map(toInterview)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  } catch (error) {
    console.error("getInterviewsByUserId failed:", error);
    return [];
  }
}

/**
 * Latest finalized interviews created by *other* users.
 * We over-fetch by createdAt only (single-field index, always available) and
 * filter in memory to avoid needing a composite index for `!=` + orderBy.
 */
export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[]> {
  const { userId, limit = 20 } = params;

  try {
    const snapshot = await db
      .collection("interviews")
      .orderBy("createdAt", "desc")
      .limit(Math.min(limit * 4, 100))
      .get();

    return snapshot.docs
      .map(toInterview)
      .filter((i) => i.finalized && i.userId !== userId)
      .slice(0, limit);
  } catch (error) {
    console.error("getLatestInterviews failed:", error);
    return [];
  }
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  try {
    const doc = await db.collection("interviews").doc(id).get();
    if (!doc.exists) return null;
    return toInterview(doc);
  } catch (error) {
    console.error("getInterviewById failed:", error);
    return null;
  }
}

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  try {
    const snapshot = await db
      .collection("feedback")
      .where("interviewId", "==", interviewId)
      .where("userId", "==", userId)
      .limit(1)
      .get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Feedback;
  } catch (error) {
    console.error("getFeedbackByInterviewId failed:", error);
    return null;
  }
}

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId } = params;

  if (!transcript.length) {
    return { success: false, message: "The interview transcript is empty." };
  }

  try {
    const formattedTranscript = transcript
      .map((s) => `- ${s.role}: ${s.content}\n`)
      .join("");

    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: feedbackSchema,
      system:
        "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and honest; do not be lenient. If there are mistakes or areas for improvement, point them out.",
      prompt: `Transcript:
${formattedTranscript}

Score the candidate from 0 to 100 in each of these categories, in this exact order, and nothing else:
${FEEDBACK_CATEGORIES.map((c, i) => `${i + 1}. ${c}`).join("\n")}

Then provide strengths, areas for improvement, and a short final assessment. Also provide a totalScore (0-100) that reflects the overall performance.`,
    });

    const feedback = {
      interviewId,
      userId,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      createdAt: new Date().toISOString(),
    };

    const feedbackRef = feedbackId
      ? db.collection("feedback").doc(feedbackId)
      : db.collection("feedback").doc();

    await feedbackRef.set(feedback);

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error) {
    console.error("createFeedback failed:", error);
    return { success: false, message: "Failed to generate feedback." };
  }
}
