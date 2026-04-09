"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form" // Removed unused FormItem, FormLabel
import Image from 'next/image'
import Link from 'next/link'
import { toast } from "sonner"
import FormField from './FormField' // This is your custom wrapper
import { useRouter } from 'next/navigation'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/firebase/client'
import { signIn, signUp } from '@/lib/actions/auth.action'

//we are storing auth in server sidefor more secucity as the idtoken is vulnerable at client side
// also token expires on client fast and user will be signed out, so we will set cookie from server side and manage session there
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
  const router = useRouter();
  const isSignIn = type === 'sign-in';
  const schema = authFormSchema(type);

  // 2. Initializing form with correct types
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "",
      email: "",
      password: ""
    },
  })

  async function onSubmit(data: z.infer<typeof schema>) {
    try {
      if (type === 'sign-up') {
        const{username,email,password} = data;
        const userCredentials  = await createUserWithEmailAndPassword(auth, email,password);


        const result = await signUp({
          uid: userCredentials.user.uid,
          name: username! ,
          email,
          password,
        })
        if(!result?.success ){
          toast.error(result?.message);
          return;
        }

        toast.success("Account created! Please sign in.");
        router.push('/sign-in');


      } else {
        const {email, password} = data;
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await userCredential.user.getIdToken();
        if(!idToken){
          toast.error("Failed to sign in. Please try again.");
          return;
        }
        await signIn({email, idToken})
        
        toast.success("Welcome back to Intervo!");
        router.push('/');
      }
    } catch (error) {
      
      console.error("Auth Error:", error);
      toast.error("Authentication failed. Please check your credentials.");
    }
  }

  return (
      <div className="card-border w-full max-w-[566px] lg:min-w-[566px]">    
      <div className="flex flex-col gap-6 card py-14 px-10 shadow-lg bg-white rounded-2xl">
        
        {/* Header Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-row gap-2 justify-center items-center">
            <Image src="/logo.svg" alt="PrepWise Logo" height={32} width={38} />
            <h2 className="text-3xl font-bold text-primary tracking-tight">PrepWise</h2>
          </div>
          <h3 className="text-muted-foreground font-medium">Practice job interviews with AI</h3>
        </div>

        {/* Form Section */}
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

            <Button className="w-full py-6 text-lg" type="submit">
              {isSignIn ? 'Sign In' : 'Create an account'}
            </Button>
          </form>
        </Form>

        {/* Footer Link */}
        <p className='text-center text-sm text-gray-300'>
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

export default AuthForm