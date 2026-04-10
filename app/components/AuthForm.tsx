"use client"

import { useState } from "react" // Added for loading state
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import Image from 'next/image'
import Link from 'next/link'
import { toast } from "sonner"
import FormField from './FormField'
import { useRouter } from 'next/navigation'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/firebase/client'
import { signIn, signUp } from '@/lib/actions/auth.action'
import { Loader2 } from "lucide-react" // For the loading spinner

const authFormSchema = (type: 'sign-in' | 'sign-up') => {
  return z.object({
    username: type === 'sign-up' 
      ? z.string().min(3, "Username must be at least 3 characters long") 
      : z.string().optional(),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long")
  })
}

const AuthForm = ({ type }: { type: 'sign-in' | 'sign-up' }) => {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter();
  const isSignIn = type === 'sign-in';
  const schema = authFormSchema(type);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "",
      email: "",
      password: ""
    },
  })

  async function onSubmit(data: z.infer<typeof schema>) {
  setIsLoading(true);
  
  // SIGN UP BLOCK
  if (type === 'sign-up') {
    try {
      const { username, email, password } = data;
      const userCredentials = await createUserWithEmailAndPassword(auth, email, password);

      const result = await signUp({
        uid: userCredentials.user.uid,
        name: username!,
        email,
        password,
      });

      if (result?.success) {
        toast.success(result.message);
        router.push('/sign-in');
      } else {
        toast.error(result?.message);
      }
    } catch (error: any) {
      // Handle SignUp errors here (Email taken, etc.)
      console.log("Sign Up Error:", error.code);
      if (error.code === 'auth/email-already-in-use') {
        toast.error("Email already in use. Try signing in!");
        router.push('/sign-in');
      } else {
        toast.error("Could not create account. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
    return; // Stop here so it doesn't run the sign in code
  }

  // sign in block
  if (type === 'sign-in') {
    try {
      const { email, password } = data;
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();

      const result = await signIn({ email, idToken });

      if (result?.success) {
        toast.success(result.message);
        setTimeout(() => router.push('/'), 500);
      } else {
        toast.info(result?.message || "Redirecting to Sign Up...");
        router.push('/sign-up');
      }
    } catch (error: any) {
      // Handle SignIn errors here (Wrong pass, No user)
      console.log("Sign In Error:", error.code);
      toast.info("Account not recognized. Moving to Sign Up...");
      router.push('/sign-up');
    } finally {
      setIsLoading(false);
    }
  }
}
  return (
    <div className="card-border w-full max-w-[566px] lg:min-w-[566px]">    
      <div className="flex flex-col gap-6 card py-14 px-10 shadow-lg bg-white rounded-2xl">
        
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-row gap-2 justify-center items-center">
            <Image src="/logo.svg" alt="Intervo Logo" height={32} width={38} />
            <h2 className="text-3xl font-bold text-primary tracking-tight">Intervo</h2>
          </div>
          <h3 className="text-muted-foreground font-medium">Practice job interviews with AI</h3>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

            <Button className="w-full py-6 text-lg" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait...
                </>
              ) : (
                isSignIn ? 'Sign In' : 'Create an account'
              )}
            </Button>
          </form>
        </Form>

        <p className='text-center text-sm text-gray-500'>
          {isSignIn ? "Don't have an account?" : "Already have an account?"}
          <Link 
            href={isSignIn ? '/sign-up' : '/sign-in'} 
            className='font-bold text-primary hover:underline ml-1'
          >
            {isSignIn ? 'Sign Up' : 'Sign In'}
          </Link>
        </p>
      </div>
    </div>
  )
}

export default AuthForm;