"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import FormField from "./FormField";
import { auth } from "@/firebase/client";
import { signIn, signUp } from "@/lib/actions/auth.action";

const authFormSchema = (type: FormType) => {
  return z.object({
    username:
      type === "sign-up"
        ? z.string().min(3, "Name must be at least 3 characters long")
        : z.string().optional(),
    email: z.email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
  });
};

/** Extracts the `code` from a Firebase client SDK error, if present. */
const getFirebaseErrorCode = (error: unknown): string => {
  if (typeof error === "object" && error !== null && "code" in error) {
    return String((error as { code: unknown }).code);
  }
  return "unknown";
};

const AuthForm = ({ type }: { type: FormType }) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const isSignIn = type === "sign-in";
  const schema = authFormSchema(type);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const handleSignUp = async (data: z.infer<typeof schema>) => {
    const { username, email, password } = data;

    try {
      const userCredentials = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Store the display name on the Firebase auth user too so the server
      // can recover it if the Firestore profile is ever missing.
      if (username) {
        await updateProfile(userCredentials.user, { displayName: username });
      }

      const result = await signUp({
        uid: userCredentials.user.uid,
        name: username!,
        email,
        password,
      });

      if (result.success) {
        toast.success(result.message);
        router.push("/sign-in");
      } else {
        toast.error(result.message);
      }
    } catch (error: unknown) {
      const code = getFirebaseErrorCode(error);
      console.error("Sign up error:", code);

      switch (code) {
        case "auth/email-already-in-use":
          toast.error("This email is already in use. Try signing in.");
          router.push("/sign-in");
          break;
        case "auth/invalid-email":
          toast.error("That email address is not valid.");
          break;
        case "auth/weak-password":
          toast.error("Please choose a stronger password.");
          break;
        default:
          toast.error("Could not create your account. Please try again.");
      }
    }
  };

  const handleSignIn = async (data: z.infer<typeof schema>) => {
    const { email, password } = data;

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const idToken = await userCredential.user.getIdToken();

      const result = await signIn({ email, idToken });

      if (result.success) {
        toast.success(result.message);
        router.push("/");
        router.refresh();
      } else if (result.code === "auth/user-not-found") {
        toast.info(result.message);
        router.push("/sign-up");
      } else {
        toast.error(result.message);
      }
    } catch (error: unknown) {
      const code = getFirebaseErrorCode(error);
      console.error("Sign in error:", code);

      switch (code) {
        case "auth/user-not-found":
          toast.info("No account found for this email. Let's create one.");
          router.push("/sign-up");
          break;
        case "auth/wrong-password":
        case "auth/invalid-credential":
        case "auth/invalid-login-credentials":
          toast.error("Incorrect email or password.");
          break;
        case "auth/too-many-requests":
          toast.error("Too many attempts. Please wait a moment and try again.");
          break;
        default:
          toast.error("Could not sign you in. Please try again.");
      }
    }
  };

  const onSubmit = async (data: z.infer<typeof schema>) => {
    setIsLoading(true);
    try {
      if (isSignIn) {
        await handleSignIn(data);
      } else {
        await handleSignUp(data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card-border w-full max-w-[566px] lg:min-w-[566px]">
      <div className="flex flex-col gap-6 card py-14 px-10">
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-row gap-2 justify-center items-center">
            <Image src="/logo.svg" alt="Intervo Logo" height={32} width={38} />
            <h2 className="text-primary-100">Intervo</h2>
          </div>
          <h3 className="text-muted-foreground font-medium">
            Practice job interviews with AI
          </h3>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-6 mt-4 form"
          >
            {!isSignIn && (
              <FormField
                control={form.control}
                name="username"
                label="Name"
                placeholder="Enter your name"
              />
            )}

            <FormField
              control={form.control}
              name="email"
              label="Email Address"
              placeholder="Enter your email"
              type="email"
            />

            <FormField
              control={form.control}
              name="password"
              label="Password"
              placeholder="Enter your password"
              type="password"
            />

            <Button className="btn w-full" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait...
                </>
              ) : isSignIn ? (
                "Sign In"
              ) : (
                "Create an account"
              )}
            </Button>
          </form>
        </Form>

        <p className="text-center text-sm">
          {isSignIn ? "Don't have an account?" : "Already have an account?"}
          <Link
            href={isSignIn ? "/sign-up" : "/sign-in"}
            className="font-bold text-primary-200 hover:underline ml-1"
          >
            {isSignIn ? "Sign Up" : "Sign In"}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
