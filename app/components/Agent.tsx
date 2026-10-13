"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer } from "@/constants";
import { createFeedback } from "@/lib/actions/general.action";

enum CallStatus {
  INACTIVE = "inactive",
  CONNECTING = "connecting",
  ACTIVE = "active",
  FINISHED = "finished",
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
  questions,
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  // Guards against running the "call finished" logic twice (e.g. a manual
  // "End" click followed by Vapi's own call-end event).
  const hasHandledEnd = useRef(false);

  useEffect(() => {
    const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
    const onCallEnd = () => setCallStatus(CallStatus.FINISHED);

    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);

    const onError = (error: Error) => {
      console.error("Vapi error:", error);
      toast.error("Something went wrong with the call. Please try again.");
      setCallStatus(CallStatus.INACTIVE);
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);

  useEffect(() => {
    if (callStatus !== CallStatus.FINISHED || hasHandledEnd.current) return;
    hasHandledEnd.current = true;

    const handleGenerateFeedback = async () => {
      if (!interviewId || !userId) {
        router.push("/");
        return;
      }

      if (messages.length === 0) {
        toast.info("The interview ended before anything was said.");
        router.push("/");
        return;
      }

      setIsGeneratingFeedback(true);
      const result = await createFeedback({
        interviewId,
        userId,
        transcript: messages,
        feedbackId,
      });

      if (result.success) {
        router.push(`/interview/${interviewId}/feedback`);
      } else {
        toast.error(result.message ?? "Could not generate feedback.");
        setIsGeneratingFeedback(false);
        router.push("/");
      }
    };

    if (type === "generate") {
      toast.success("Interview generated. Refreshing your dashboard...");
      router.push("/");
      router.refresh();
    } else {
      handleGenerateFeedback();
    }
  }, [callStatus, messages, type, userId, interviewId, feedbackId, router]);

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);
    hasHandledEnd.current = false;
    setMessages([]);

    try {
      if (type === "generate") {
        const agentId = process.env.NEXT_PUBLIC_VAPI_AGENT_ID;
        if (!agentId) {
          throw new Error("NEXT_PUBLIC_VAPI_AGENT_ID is not configured.");
        }

        await vapi.start(agentId, {
          variableValues: {
            username: userName,
            userid: userId,
          },
        });
      } else {
        const formattedQuestions = (questions ?? [])
          .map((question) => `- ${question}`)
          .join("\n");

        await vapi.start(interviewer, {
          variableValues: {
            questions: formattedQuestions,
          },
        });
      }
    } catch (error) {
      console.error("Failed to start call:", error);
      toast.error("Could not start the call. Check your microphone and try again.");
      setCallStatus(CallStatus.INACTIVE);
    }
  };

  const handleDisconnect = () => {
    vapi.stop();
    setCallStatus(CallStatus.FINISHED);
  };

  const latestMessage = messages[messages.length - 1]?.content;
  const isCallInactiveOrFinished =
    callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

  return (
    <>
      <div className="call-view">
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="AI interviewer avatar"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
        </div>

        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.png"
              alt="user avatar"
              width={540}
              height={540}
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p
              key={latestMessage}
              className={cn(
                "transition-opacity duration-500 opacity-0",
                "animate-fadeIn opacity-100"
              )}
            >
              {latestMessage}
            </p>
          </div>
        </div>
      )}

      <div className="w-full flex justify-center">
        {isGeneratingFeedback ? (
          <p className="text-center">Generating your feedback...</p>
        ) : callStatus !== CallStatus.ACTIVE ? (
          <button
            className="relative btn-call"
            onClick={handleCall}
            disabled={callStatus === CallStatus.CONNECTING}
          >
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== CallStatus.CONNECTING && "hidden"
              )}
            />
            <span className="relative">
              {isCallInactiveOrFinished ? "Call" : "Connecting..."}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={handleDisconnect}>
            End
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;
