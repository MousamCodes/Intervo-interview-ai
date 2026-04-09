import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'
import Image from 'next/image'
import { dummyInterviews } from '@/constants'
import InterviewCard from '../components/InterviewCard'
const page = () => {
  return (
    <>
    <section className = "card-cta">
      <div className = "flex flex-col gap-8 max-w-lg">
        <h2>Get Interview-Ready with AI powered preparation</h2>
        <p className='text-lg'>
           Practice coding problems, behavioral questions, and receive personalized feedback to ace your next interview.
        </p>
        <Button className="max-sm:w-full" asChild>
          <Link href="/interview">Get Started</Link>
        </Button>
        
      </div>
      <Image src="/robot.png" alt="robo" width={400} height={400} className="max-sm:hidden " />
    </section>

    <section className= "flex flex-col gap-6 mt-8">
      <h2>Your Interview</h2>

      <div className="interview-section grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 w-full">
       {dummyInterviews.map((interview)=>(
        <InterviewCard {...interview} key={interview.id}/>
       ))}
        </div> 

    </section>
    <section className="flex flex-col gap-6 mt-8 ">
      <h2> Take an interview </h2> 
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 w-full">
        {dummyInterviews.map((interview)=>(
        <InterviewCard {...interview} key={interview.id}/>
       ))}

       {/* <p> you havent taken any interview yet</p> */}
      </div>
      
     
    </section>
    </>
   
  )
}

export default page