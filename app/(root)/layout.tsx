import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { isAuthenticated } from "@/lib/actions/auth.action";
import SignOutButton from "@/app/components/SignOutButton";

const RootLayout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();
  if (!isUserAuthenticated) redirect("/sign-in");

  return (
    <div className="root-layout">
      <nav className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Intervo Logo" height={32} width={38} />
          <h2 className="text-primary-100">Intervo</h2>
        </Link>

        <SignOutButton />
      </nav>

      {children}
    </div>
  );
};

export default RootLayout;
