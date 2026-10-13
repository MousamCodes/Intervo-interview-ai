"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/actions/auth.action";

const SignOutButton = () => {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleSignOut = async () => {
    setIsPending(true);
    try {
      await signOut();
      router.push("/sign-in");
      router.refresh();
    } catch {
      toast.error("Could not sign out. Please try again.");
      setIsPending(false);
    }
  };

  return (
    <Button
      variant="ghost"
      className="btn-secondary"
      onClick={handleSignOut}
      disabled={isPending}
    >
      <LogOut className="size-4" />
      Sign out
    </Button>
  );
};

export default SignOutButton;
