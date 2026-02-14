<p align="center">
  <img src="./img.png" alt="Project Banner" width="100%">
</p>

# AttenSee

## Basic Details
It detects distractions (like phone usage), tracks gaze/head pose, computes a focus score, and generates intelligent alerts — all running client-side for privacy and speed.

### Team Name: Tm_Neo

### Team Members
Lekshmi Hari - NSS COLLEGE OF ENGINEERING PALAKKAD
Anaswara Saligramathil - NSS COLLEGE OF ENGINEERING PALAKKAD

### Hosted Project Link
[mention your project hosted link here]

### Project Description
AttenSee is an AI-powered behavioral analytics web application that helps students improve focus using real-time computer vision, attention scoring, and automated study tools.

It detects distractions (like phone usage), tracks gaze/head pose, computes a focus score, and generates intelligent alerts — all running client-side for privacy and speed.

### The Problem statement
Students lose focus frequently but lack real-time awareness of when and why it happens. Traditional timers only track time — not attention quality.

There is no system that:
1.Detects real distractions in real-time
2.Measures attention objectively
3.Converts lectures into automated study materials

### The Solution
AttenSee combines:

 *Client-side ML (COCO-SSD + MediaPipe)
 *Real-time focus scoring
 *Programmatic alerts
 *Whisper-based transcription
 *Gemini-powered summaries & flashcards

---

## Technical Details

### Technologies/Components Used

**For Software:**

Languages Used:

JavaScript (ES6+)

Frameworks Used:

React 18 (Vite)
Node.js
Express.js

Libraries Used:

@tensorflow/tfjs
@tensorflow-models/coco-ssd
@mediapipe/tasks-vision
axios
jsonwebtoken
recharts
lucide-react
Tailwind CSS
Web Audio API
Tools Used
VS Code
Git & GitHub
MongoDB
Postman
ESLint
Vite
PostCSS


## Features

1. Real-Time Focus Detection

Detects phone usage
Tracks head pose & gaze direction
Computes dynamic focus score
Runs entirely in-browser (privacy-first)

2.Offline-First Architecture

MongoDB as primary DB
data.json fallback if DB unavailable
Syncs when connection restores

3️.Intelligent Alerts

Web Audio API-generated beeps
Configurable severity (warning / critical)
No external audio files required

4.Lecture Processor

Upload/record lecture audio
Whisper auto-transcription
Gemini-powered summaries
Flashcard generation

5️.Weekly Planner

Goal commitments
Session tracking
Recharts analytics dashboard

6️.Secure Authentication

JWT-based auth
Protected routes middleware
Axios interceptor attaches token

---

## Implementation
### For Software:
#### Installation
1️.Clone Repository
git clone https://github.com/your-repo/attensee.git
cd attensee

2️.Install Frontend
cd client
npm install
npm run dev

3️.Install Backend
cd server
npm install
npm run dev

```

## Project Documentation

### For Software:

#### Screenshots (Add at least 3)

1.Study Mode (Real-Time Detection)
Displays live camera feed, focus score, and distraction alerts.

2.Analytics Dashboard
Shows weekly focus trends and productivity stats using Recharts.

3. Lecture Processor
Upload audio → get transcript → summary → flashcards.

#### Diagrams

**System Architecture:**

![Architecture Diagram](docs/architecture.png)
*Explain your system architecture - components, data flow, tech stack interaction*

**Application Workflow:**

Application Workflow:

1.User logs in (JWT issued)
2.Study Mode starts camera
3.COCO-SSD detects objects
4.MediaPipe tracks face & gaze
5.FocusDetector computes score
6.Alerts triggered if distracted
7.Session stored in DB/local fallback
8.Analytics dashboard updates

---

## Project Demo

### Video
https://drive.google.com/drive/folders/1q5lrEC0mlDsh5r2BHsuK8Au-Ck1f-TAG

Demonstrates:

Real-time focus detection
Phone distraction alerts
Lecture processing pipeline
Analytics dashboard

---

## AI Tools Used 

Tool Used: ChatGPT
Purpose:
Architecture planning
ML integration guidance
API design suggestions

**Human Contributions:**

Architecture design and system planning
Custom focus scoring and business logic implementation
Full integration of ML models, APIs, and backend services
Testing, debugging, and performance optimization
UI/UX design and user flow decisions

---

## Team Contributions

ANASWARA SALIGRAMATHIL:

Frontend architecture
ML integration (COCO-SSD + MediaPipe)
Focus detection pipeline

LEKSHMI HARI:

Backend API
JWT authentication
Database + offline fallback
Whisper & Gemini integration

---

## License

This project is licensed under the MIT License.

---
