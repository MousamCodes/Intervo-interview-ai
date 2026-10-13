"use server";

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";

const SESSION_DURATION = 60 * 60 * 24 * 7; // 1 week

type FirebaseError = { code?: string; message?: string };

const getErrorCode = (error: unknown) =>
  (error as FirebaseError)?.code ?? "unknown";

export async function setSessionCookie(idToken: string) {
  const cookieStore = await cookies();

  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: SESSION_DURATION * 1000,
  });

  cookieStore.set("session", sessionCookie, {
    maxAge: SESSION_DURATION,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
}

export async function signUp(params: SignUpParams) {
  const { uid, name, email } = params;

  try {
    const userRecord = await db.collection("users").doc(uid).get();
    if (userRecord.exists)
      return {
        success: false,
        message: "User already exists. Please sign in.",
      };

    await db.collection("users").doc(uid).set({
      name,
      email,
      createdAt: new Date().toISOString(),
    });

    return {
      success: true,
      message: "Account created successfully. Please sign in.",
    };
  } catch (error: unknown) {
    console.error("Error creating user:", error);
    return {
      success: false,
      message: "Failed to create account. Please try again.",
    };
  }
}

export async function signIn(params: SignInParams) {
  const { email, idToken } = params;

  try {
    // Admin SDK throws if the auth user does not exist.
    const userRecord = await auth.getUserByEmail(email);

    // Self-heal: if the Firestore profile is missing (e.g. sign-up was
    // interrupted after the auth account was created) create it now so the
    // user doesn't get stuck in a redirect loop between / and /sign-in.
    const profileRef = db.collection("users").doc(userRecord.uid);
    const profile = await profileRef.get();
    if (!profile.exists) {
      await profileRef.set({
        name: userRecord.displayName || email.split("@")[0],
        email,
        createdAt: new Date().toISOString(),
      });
    }

    await setSessionCookie(idToken);
    return {
      success: true,
      message: "Welcome to Intervo!",
    };
  } catch (error: unknown) {
    const code = getErrorCode(error);
    console.error("Admin Auth Error:", code);

    if (code === "auth/user-not-found") {
      return {
        success: false,
        code,
        message: "No account found for this email. Please sign up first.",
      };
    }

    return {
      success: false,
      code,
      message: "Failed to log into account. Please try again.",
    };
  }
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) return null;

  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    const userRecord = await db.collection("users").doc(decodedClaims.uid).get();

    if (!userRecord.exists) return null;

    return {
      ...userRecord.data(),
      id: userRecord.id,
    } as User;
  } catch (error) {
    console.error("Session verification failed:", error);
    return null;
  }
}

export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}
