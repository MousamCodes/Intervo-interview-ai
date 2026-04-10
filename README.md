<<<<<<< HEAD
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
=======
# Intervo 🎙️  
**Real-time AI Voice Interview Platform**

Intervo is a high-performance, full-stack platform designed to help job seekers master their interview skills through real-time AI-driven voice interactions. It simulates technical and behavioral interviews, providing instant feedback, scoring, and performance analytics to bridge the gap between preparation and placement.

---

## 🚀 Key Features
* **Real-Time Voice Interaction:** Seamless audio-based interview experience powered by AI.
* **AI-Driven Feedback:** Instant scoring and personalized insights for every answer.
* **Secure Authentication:** Professional-grade session management using **Firebase Admin SDK** and **HTTP-only cookies**.
* **Responsive Dashboard:** A clean, grid-based UI to track past interview performances and scores.
* **Dynamic Tech Stack:** Automatically identifies and displays tech stack icons for targeted interview practice.

---

## 🛠️ Tech Stack
* **Frontend:** [Next.js 14+](https://nextjs.org/) (App Router), TypeScript, Tailwind CSS.
* **UI Components:** Shadcn/UI, Lucide React, Sonner (Toasts).
* **Backend:** Next.js Server Actions.
* **Authentication:** Firebase Client SDK + Firebase Admin SDK (Session Cookies).
* **Database:** Cloud Firestore.
* **Typography:** Mona Sans.

---

## 🏗️ Architecture & Security
Intervo utilizes a dual-SDK Firebase approach to ensure maximum security and scalability:

1.  **Client-Side:** Handles the initial user handshake and Firebase Auth triggers.
2.  **Server-Side:** Uses `firebase-admin` to verify ID tokens and manage `HTTP-only` session cookies. This prevents common vulnerabilities like XSS and CSRF by keeping the session logic strictly on the server.



---

## 📂 Project Structure
```text
├── app/                  # Next.js App Router (Pages, Layouts, & Styles)
├── components/           # Reusable UI components (Shadcn + Custom)
├── firebase/             # Firebase Client & Admin SDK configurations
├── lib/                  # Core logic
│   ├── actions/          # Auth, SignIn, and Server-side logic
│   └── utils.ts          # Helper functions & Tailwind merging
├── public/               # Static assets (Logos, Icons, SVGs)
└── types/                # TypeScript interfaces (User, Interview, Feedback)
>>>>>>> d72c2f08175be28b67707bd47d23f727c8aed058
