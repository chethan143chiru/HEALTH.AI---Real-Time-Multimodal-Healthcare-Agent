# HEALTH.AI

## Overview
**HEALTH.AI** is an enterprise-grade multimodal healthcare AI diagnostic, screening, and hospital administration platform. Built for the **AI Build Challenge 2026 (Build Fast with AI)**, it unifies clinical AI disease prediction, prescription pharmacology OCR, radiological medical image analysis, live camera surface lesion screening, and an empathetic real-time voice agent into one cohesive clinical ecosystem.

---

## PS05 – Real-Time Voice & Multimodal Agents
This system fulfills **Problem Statement 05 (PS05)** by implementing a real-time multimodal healthcare AI agent capable of simultaneous bidirectional streaming audio, camera video frame processing, and autonomous healthcare tool orchestration:

* **Real-Time Voice Conversation**: Raw 16kHz PCM streaming input with gapless 24kHz PCM audio output powered by the **Gemini Live API** (`gemini-3.8-live`).
* **Barge-In / Natural Interruption**: Real-time cancellation and flushing of active audio buffer source nodes the moment the user begins speaking.
* **Multimodal Camera Vision**: 1 FPS video frame capture feeding directly into the live multimodal model for real-time visual inspection of prescriptions, dermatological lesions, and clinical scans.
* **Autonomous Tool Orchestration**: Decoupled tool registry allowing the Live Agent to invoke differential diagnosis screening, prescription extraction, vitals retrieval, and report generation in real time.
* **Triage Safety Layer**: Instant identification of acute emergency red flags (e.g. chest pain, breathing difficulty, stroke signs) with immediate local hotline referrals (112 / 911 / 1075).

---

## Features
- **Real-Time Live Health Agent**: Persistent WebSocket connection (`/ws/live-health-agent`) enabling low-latency voice, live camera vision, and tool activity tracking.
- **AI Disease Prediction**: Dual-engine architecture combining Google Gemini with a 500+ disease Bayesian classification ML model for explainable differential diagnosis.
- **Prescription OCR Analyzer**: Extracts handwritten doctor notes, medications, dosages, frequency, and relations to food.
- **Medical Image Analyzer**: Evaluates X-rays, CTs, MRIs, and ultrasounds with image quality checking and anatomical pattern correlation.
- **Live Camera Disease Detection**: Surface lesion dermatology screening with bounding region annotations.
- **Verified Health Metrics**: Tracks blood pressure, heart rate, oxygen saturation (SpO2), BMI, and blood glucose.
- **Patient History & Analytics**: Searchable records, health stability indices, and symptom progression timelines.
- **Clinical Report Export**: Formats clinical screening summaries into downloadable PDF reports.
- **Super Admin Control Center**: Role-based access control (RBAC), immutable audit logging, AI telemetry, system health status, and broadcast center.

---

## Architecture

```
                    USER
                     │
       ┌─────────────┼─────────────┐
       │             │             │
     Voice         Text       Camera / Image
    (16kHz)     (JSON/Chat)     (1 FPS JPEGs)
       │             │             │
       └─────────────┼─────────────┘
                     ▼
           HEALTH.AI LIVE AGENT
       (WebSocket Gateway /ws/live)
                     │
                     ▼
                TOOL ROUTER
                     │
       ┌─────────────┼─────────────┐
       ▼             ▼             ▼
   Local ML     Gemini Flash  Health Data
  (500+ Classes) (Multimodal)  (Firestore)
       │             │             │
       └─────────────┼─────────────┘
                     ▼
             CLINICAL SAFETY LAYER
         (Emergency Triage 112 / 911)
                     ▼
            REAL-TIME RESPONSE
                     │
       ┌─────────────┼─────────────┐
       │             │             │
     Voice         Text         Visual
   (24kHz PCM)  (Transcript)  (Tool Cards)
```

---

## AI Models
| Purpose | Model | Description |
| :--- | :--- | :--- |
| **Real-Time Voice Agent** | `gemini-3.8-live` | Low-latency audio-to-audio streaming via the official Gemini Live API (`ai.live.connect`) with tool calling. |
| **General Multimodal / Non-Live AI** | `gemini-3.8-flash` | Diagnostic reasoning, prescription OCR, and medical scan analysis. |
| **Local Clinical ML Engine** | Bayesian Classifier | In-memory 500+ disease differential diagnosis trained on verified symptom matrices for resilient offline fallback. |
| **Local NLP Health Assistant** | TF-IDF / Heuristic Engine | Conversational health guidance with built-in emergency red-flag filters. |

---

## Security
- **Server-Side Authorization**: Roles (`admin`, `user`) are enforced on the backend and validated against Firestore records. A role is never granted from a client-supplied email, URL parameter, or `localStorage` flag.
- **Zero API Key Leakage**: `GEMINI_API_KEY` exists only in the server environment. The Vite config does **not** inject it into the frontend bundle, and the browser reaches AI functionality exclusively through authenticated backend endpoints and the realtime WebSocket gateway.
- **Verified Realtime Identity**: The Live Agent WebSocket derives the user identity from a **Firebase ID token verified server-side** (`verifyIdToken`), not from client-supplied `uid`/`email` fields.
- **Password Storage**: Passwords are hashed with **scrypt** (memory-hard KDF). Legacy SHA-256 hashes are verified once and transparently upgraded on successful login. Plaintext passwords are never stored or logged.
- **Demo Accounts Are Development-Only**: The convenience `user` / `admin` demo logins are hard-disabled when `NODE_ENV=production`, so they can never grant privileged access on a deployed instance.
- **Rate Limiting**: AI, authentication, and image-analysis endpoints are rate limited in-process to prevent accidental or abusive request floods.
- **Identity Isolation**: Tool executions derive `userId` strictly from the server-verified session. Cross-user data retrieval is prevented by server-side validation and the `firestore.rules` per-user isolation rules.
- **Audit Logging**: Sensitive administrative actions, predictions, and authentications are appended to the `activities` audit ledger.

---

## Medical Safety & Disclaimer
> **IMPORTANT CLINICAL NOTICE**: HEALTH.AI is an assistive AI screening and clinical decision-support tool designed for informational and educational purposes. It is **NOT** an autonomous physician, definitive diagnostic device, or replacement for professional clinical evaluation. In the event of acute or severe symptoms (such as crushing chest pain or difficulty breathing), users are immediately directed to emergency services (112 in India, 911 in the US).

---

## Running Locally

### Prerequisites
- Node.js (v20+ or v22+)
- Valid `GEMINI_API_KEY`

### Environment Variables
The application requires only two environment variables:

| Variable | Purpose |
| :--- | :--- |
| `GEMINI_API_KEY` | Server-side Gemini API access (Live + Flash). Never exposed to the browser. |
| `APP_URL` | The URL where the applet is hosted. |

### Setup Instructions
1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Configure your environment variables in `.env`:
   ```bash
   cp .env.example .env
   # Add your GEMINI_API_KEY
   ```
   > Demo accounts (`user` / `admin`) are available only when `NODE_ENV` is **not** `production`.
3. Start the full-stack development server (Express backend + Vite frontend on port 3000):
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```
