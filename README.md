# Intervo 🎙️

**Real-time AI Voice Interview Platform**

Intervo helps job seekers practice interviews through real-time AI voice conversations. It generates tailored interview questions, conducts the interview by voice, and scores the candidate with personalized, category-by-category feedback.

---

## 🚀 Key Features

- **AI question generation:** Describe the role, level, tech stack and interview type by voice and Gemini generates a tailored question set.
- **Real-time voice interviews:** A Vapi-powered interviewer asks the questions, listens, and follows up naturally.
- **AI-driven feedback:** After the call, the transcript is scored across Communication, Technical Knowledge, Problem Solving, Cultural Fit, and Confidence.
- **Secure authentication:** Firebase Auth on the client plus Firebase Admin session cookies (HTTP-only) on the server.
- **Dashboard:** Track your past interviews and scores, and take interviews created by other users.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS v4, shadcn/ui, Lucide icons, Sonner toasts
- **Voice:** [Vapi](https://vapi.ai) Web SDK
- **AI:** Vercel AI SDK + Google Gemini (`gemini-2.5-flash`)
- **Auth & Database:** Firebase Auth, Cloud Firestore, Firebase Admin SDK

---

## ⚙️ Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```env
# Firebase Admin (Project settings → Service accounts → Generate new private key)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Google AI Studio (https://aistudio.google.com/apikey)
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key

# Vapi (https://dashboard.vapi.ai)
NEXT_PUBLIC_VAPI_WEB_TOKEN=your-vapi-public-key
NEXT_PUBLIC_VAPI_AGENT_ID=your-vapi-assistant-or-workflow-id
```

The Firebase **client** config lives in `firebase/client.ts`. Those values are public by design; update them to match your own Firebase project.

### 3. Firebase setup

1. Enable **Email/Password** sign-in under Authentication → Sign-in method.
2. Create a **Cloud Firestore** database. The app uses three collections: `users`, `interviews`, and `feedback`. No composite indexes are required.

### 4. Vapi setup

The interview *generation* flow starts the Vapi assistant/workflow referenced by `NEXT_PUBLIC_VAPI_AGENT_ID`. That assistant should collect `role`, `level`, `type`, `techstack` and `amount` from the user and then call this app's endpoint:

```
POST https://<your-domain>/api/vapi/generate
Content-Type: application/json

{
  "role": "Frontend Developer",
  "level": "Junior",
  "type": "Technical",
  "techstack": "React, TypeScript, Next.js",
  "amount": 5,
  "userid": "{{userid}}"
}
```

`userid` and `username` are passed to the assistant as variable values when the call starts. For local testing expose your dev server with a tunnel (e.g. `ngrok http 3000`) so Vapi can reach it.

The interview *taking* flow uses a transient assistant defined in `constants/index.ts` (`interviewer`), so no extra dashboard configuration is needed for it.

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 📂 Project Structure

```text
├── app/
│   ├── (auth)/               # Sign-in / sign-up pages
│   ├── (root)/               # Authenticated app
│   │   ├── page.tsx          # Dashboard
│   │   └── interview/
│   │       ├── page.tsx      # Generate a new interview (voice)
│   │       └── [id]/         # Take an interview + view feedback
│   ├── api/vapi/generate/    # Endpoint Vapi calls to create an interview
│   └── components/           # Agent, AuthForm, InterviewCard, ...
├── components/ui/            # shadcn/ui primitives
├── constants/                # Tech-icon mappings, interviewer assistant, feedback schema
├── firebase/                 # Firebase client & admin initialisation
├── lib/actions/              # Server actions (auth, interviews, feedback)
├── public/                   # Static assets
└── types/                    # Shared TypeScript types
```

---

## 🧪 Scripts

| Command         | Description                 |
| --------------- | --------------------------- |
| `npm run dev`   | Start the development server |
| `npm run build` | Create a production build    |
| `npm run start` | Run the production build     |
| `npm run lint`  | Run ESLint                   |
