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
