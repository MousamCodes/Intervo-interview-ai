'use client'

import { cn } from '@/lib/utils';
import Image from 'next/image'
import { useState } from 'react';

enum CallStatus{
  INACTIVE = 'inactive',
  CONNECTING ='connecting',
  ACTIVE = 'active',
  ENDED = 'ended',

}


const Agent = ({userName}: AgentProps) => {
  const [status, setStatus] = useState<CallStatus>(CallStatus.INACTIVE); // Placeholder for call status
  const [isSpeaking, setIsSpeaking] = useState(false); // Placeholder for speaking stat
  const [messages] = useState([
  'Welcome! I am Intervo, your virtual interview assistant.'
]);
  const lastMessage = messages[messages.length - 1];

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
            <p key={lastMessage} 
            className={cn(
              " transition-opacity duration-500 opacity-0",
               'animate-fadeIn opacity-100')}>
              {lastMessage}
            </p>
          </div>
          
        </div>
      )}
    <div className="w-full flex justify-center">
      { status !== CallStatus.ACTIVE ? (
        <button className="relative btn-call">
          <span className={cn(
            'absolute animate-ping rounded-full opacity-75',
           status!== CallStatus.CONNECTING &&'hidden')}
            />

            <span>
              {status == CallStatus.INACTIVE|| status === CallStatus.ENDED ?'CALL':'. . .'}
            </span>
          
         
          </button>
        ) : (
          <button className="btn-disconnect">
            End
          </button>
        )
      }

    </div>
    
    </>
    
  )
}

export default Agent