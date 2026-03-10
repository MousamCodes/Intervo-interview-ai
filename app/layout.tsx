import type { Metadata } from "next";
import { Mona_Sans, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const monaSans = Mona_Sans({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "Intervo",
  description: "AI powered platform for interview prep",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className= {cn("dark", "font-sans", geist.variable)}>
      <body
        className={`${monaSans.className}  antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
