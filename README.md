<div align="center">
  <img src="https://img.icons8.com/color/120/000000/bot.png" alt="DevOps Buddy Logo" width="100"/>
  <h1>DevOps Buddy</h1>
  <p><strong>Autonomous Infrastructure Remediation & AI-Powered Auto-Fix Pipeline</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/Express-Backend-blue?style=flat-square&logo=express" alt="Express" />
    <img src="https://img.shields.io/badge/PostgreSQL-Database-336791?style=flat-square&logo=postgresql" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Google_Gemini-AI-orange?style=flat-square&logo=google" alt="Gemini" />
    <img src="https://img.shields.io/badge/Clerk-Auth-6C47FF?style=flat-square" alt="Clerk" />
  </p>
</div>

<br/>

## 🚀 Overview
**DevOps Buddy** is a next-generation, AI-driven automation agent designed to act as your autonomous Site Reliability Engineer (SRE). Instead of just alerting you when your infrastructure or code breaks, DevOps Buddy intelligently analyzes the error, fetches the relevant source code, writes a fix, and opens a Pull Request on GitHub—completely autonomously.

It pairs a powerful **Express.js orchestration backend** with a stunning, real-time **Next.js glassmorphism dashboard**, allowing developers to monitor live log ingestion, track AI confidence scores (Q-Values), and review automated deployments.

---

## ✨ Features

- 🧠 **Autonomous Remediation:** Ingests error logs, queries GitHub for the problematic source files, and uses **Google Gemini Pro** to write code fixes.
- 🔄 **Reflexive Loop Engine:** The AI criticizes its own generated code up to 3 times, refining the fix until it is confident it works.
- 📈 **Reinforcement Learning Scoring:** Uses a Q-Value system to score the confidence of fixes based on historical success rates stored in PostgreSQL.
- 🔗 **Zero-Touch Deployments:** Automatically commits fixes to a new branch and opens a GitHub Pull Request with a detailed root-cause analysis.
- 🎨 **Command Center Dashboard:** A premium, real-time Next.js UI featuring dynamic sparklines, stat cards, and log tracking.
- 🔒 **Enterprise-Grade Authentication:** Secured via Clerk to ensure only authorized engineers can trigger manual fixes or view logs.

---

## 🛠️ Tech Stack

### Frontend (Dashboard)
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS, Framer Motion (Micro-animations), Custom Glassmorphism UI
- **Auth:** Clerk
- **Icons:** Lucide React

### Backend (Orchestration)
- **Server:** Node.js & Express.js
- **Database:** PostgreSQL (for tracking Q-Values, RL States, and Fix History)
- **AI Engine:** Google Generative AI SDK (`gemini-2.5-pro`)
- **Integrations:** GitHub REST API

---

## 🏗️ Architecture Flow
1. **Ingestion:** An error log is manually fed via the Dashboard or ingested via API.
2. **Analysis:** The backend hashes the error and searches the PostgreSQL database for past encounters.
3. **Fetching:** The agent automatically identifies the failing file and pulls its contents via the GitHub API.
4. **Resolution:** The `reflexiveFixLoop` uses Gemini to generate a fix, analyze the patch, and refine it.
5. **Deployment:** The backend pushes the patched file to a new branch and creates a PR.
6. **Telemetry:** The Next.js dashboard polls the backend to display the newly created PR and the AI's confidence rating.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database
- Google Gemini API Key
- GitHub Personal Access Token (with repo access)
- Clerk API Keys

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/devops-buddy.git
   cd devops-buddy
   ```

2. **Setup the Backend:**
   ```bash
   # Install dependencies
   npm install
   
   # Setup your .env file
   cp .env.example .env 
   
   # Run database migrations
   npm run migrate
   
   # Start the Express server
   npm run dev
   ```

3. **Setup the Frontend Dashboard:**
   ```bash
   cd DevOps-Buddy-UI
   
   # Install dependencies
   npm install
   
   # Setup your .env.local file for Clerk
   cp .env.local.example .env.local
   
   # Start the Next.js application
   npm run dev
   ```

4. **Access the Dashboard:**
   Open your browser and navigate to `http://localhost:3000/dashboard`

---

## ☁️ Deployment
This project includes a `render.yaml` Blueprint for seamless 1-click deployment on [Render](https://render.com). 
It automatically sets up two services: the Next.js frontend and the Express backend, dynamically linking the backend's URL to the frontend environment.

---

## 📄 License
This project is licensed under the MIT License.
