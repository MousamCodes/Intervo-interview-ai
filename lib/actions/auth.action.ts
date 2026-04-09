'use server';

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";


 // in seconds
const ONE_WEEK = 60*60*24*7;
export async function signUp(params: SignUpParams) {
  const { uid, name, email, password } = params;

    try {
        const userRecord = await db.collection('users').doc(uid).get();
        if (userRecord.exists){
            return{
                success: false,
                message: "User already exists.SignIn instead"
            }
        }
        await db.collection('users').doc(uid).set({ 
            name, email, password
        })
         return{
            success : true,
            message: "User created successfully. Please sign in."
         }
         
    }catch(e:any)
    {
        console.error("Error signing up:", e);
        if(e.code === "auth/email-already-in-use")
        {
            return {
                success: false,
                message: "Email is already in use."
            };
        }
        return {
            success: false,
            message: "Failed to sign up. Please try again."
        }
    } 
}

export async function signIn(params: SignInParams) {
    const { email, idToken } = params;
    try{ 
        const userRecord = await auth.getUserByEmail(email);
        if(!userRecord){
            return {
                success:false,
                message:"Invalid email. Create an account."
            }
        } await setSessionCookie(idToken);
        return {
            success:true,
            message:"Signed in successfully."
        }

    }catch(e:any){
        console.log(e);
        return {
            success:false,
            message:"Failed to sign in. Please try again."
        }

}
}
export async function setSessionCookie(idToken: string ){
    const cookieStore= await cookies();

    const sessionCookie = await auth.createSessionCookie(idToken,
         {expiresIn: ONE_WEEK*1000})//expire in a week multiplied with millisecs

    cookieStore.set('session', sessionCookie, {
        maxAge: ONE_WEEK, //expire in a week in seconds
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax'
    });
}

export async function getCurrentUser(): Promise<User | null> { // for letting only verified users to access the app and also to get user details in client side without passing them from server
    const cookieStore = await cookies();

    const sessionCookie = cookieStore.get('session')?.value;

    if(!sessionCookie) return null;
    try{
        const decodedClaims= await auth.verifySessionCookie(sessionCookie, true);

        const userRecord = await db.collection('users').doc(decodedClaims.uid).get();
        if(!userRecord.exists) return null;
        return {
            ...userRecord.data(),
            id: userRecord.id,

        } as User;

    }
    catch(e:any){
        console.log("Error verifying session cookie:", e);
        return null;
}
}

export async function isAuthenticated() { //whether user is authenticated or not, we can use this in server components to protect routes
    const user = await getCurrentUser();


    return !!user; //true-> authenticated, false-> not authenticated we use double negation to convert user object to boolean example: if user is null (means no user), !user is true, and !!user is false. If user is an object, !user is false, and !!user is true.
}