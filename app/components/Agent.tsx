'use client'

import { cn } from '@/lib/utils';
import Image from 'next/image'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { vapi } from "@/lib/vapi.sdk";




enum CallStatus{
  INACTIVE = 'inactive',
  CONNECTING ='connecting',
  ACTIVE = 'active',
  ENDED = 'ended',

}
interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}


const Agent = ({ 
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,}: AgentProps) => {
  const router = useRouter();
  const [status, setStatus] = useState<CallStatus>(CallStatus.INACTIVE); // Call status state inactive, connecting, active, ended
  const [isSpeaking, setIsSpeaking] = useState(false); // Placeholder for speaking stat
  const [messages, setMessages] = useState<SavedMessage[]>([]);

  
useEffect(() => { //what it needs to do when the component is mounted, and also clean up when unmounted
  const onCallStart = () => setStatus(CallStatus.ACTIVE);
  const onCallEnd = () => setStatus(CallStatus.ENDED);

   const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);

    const onError = (error: Error)=> console.log('Error',error);


    //All the listeners for vapi events
    vapi.on('call-start', onCallStart); // adding all functions to vapi
    vapi.on('call-end', onCallEnd);
    vapi.on('message', onMessage);
    vapi.on('speech-start', onSpeechStart);
    vapi.on('speech-end', onSpeechEnd);
    vapi.on('error', onError);

    return () => {
    vapi.off('call-start', onCallStart); // removing all functions from vapi when not using
    vapi.off('call-end', onCallEnd);
    vapi.off('message', onMessage);
    vapi.off('speech-start', onSpeechStart);
    vapi.off('speech-end', onSpeechEnd);
    vapi.off('error', onError);
    }



}, [])

useEffect(() =>{
  if (status === CallStatus.ENDED) router.push('/');
},[messages, status, type, userId]) 

//starting the call with vapi, passing the agent id and variable values for the conversation
const handleCall = async () => {
  setStatus(CallStatus.CONNECTING);

  await vapi.start(process.env.NEXT_PUBLIC_VAPI_AGENT_ID!, {
    variableValues: {
      username: userName,
      userid: userId,


    }
  })
}
const handleCallEnd = async () => {
  setStatus(CallStatus.ENDED);
  vapi.stop();
}
const latestMessage = messages[messages.length - 1]?.content;
const isCallInactiveOrEnded = status === CallStatus.INACTIVE || status === CallStatus.ENDED;
  return (
    <>
    
    <div className="call-view">
      <div className="card-interviewer">
          <div className="avatar">
            <Image src="/ai-avatar.png" 
            alt="vapi avatar" width={65} height={54}
             className="object-cover" />
            {isSpeaking && <span className="animate-speak"></span> }
          </div>
          <h3>AI Interviewer</h3>
      </div>

      
      <div className="card-border">
        <div className="card-content">
          <Image src="/user-avatar.png" 
          alt="user avatar" width={540} height={540} 
          className="rounded-full object-cover size-[120px]"
          />
          <h3>{userName}</h3>
        </div>
      </div>
    </div>

        {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p key={latestMessage} 
            className={cn(
              " transition-opacity duration-500 opacity-0",
               'animate-fadeIn opacity-100')}>
              {latestMessage}
            </p>
          </div>
          
        </div>
      )}
    <div className="w-full flex justify-center">
      { status !== CallStatus.ACTIVE ? (
        <button className="relative btn-call" onClick={handleCall}>
          <span className={cn(
            'absolute animate-ping rounded-full opacity-75',
           status!== CallStatus.CONNECTING &&'hidden')}
            />

            <span>
              {isCallInactiveOrEnded ? 'Call' : 'Connecting...'}
            </span>
          
         
          </button>
        ) : (
          <button className="btn-disconnect" onClick={handleCallEnd}>
            End
          </button>
        )
      }

    </div>
    
    </>
    
  )
}

export default Agent