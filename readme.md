# 🚀 EVALIX AI — Enterprise-Grade AI Exam Evaluation Platform

<p align="center">
  <img src="./frontend/src/assets/logo.jpeg" alt="EVALIX AI Logo" width="180" style="border-radius: 16px; box-shadow: 0 4px 20px rgba(216,90,48,0.2);"/>
</p>

<p align="center">
  <strong>Transforming academic evaluation with Multimodal Vision LLMs, automated rubrics, external grading webhooks, and absolute Human-in-the-Loop (HITL) control.</strong>
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Core Value Propositions](#-core-value-propositions)
- [System Workflow](#-system-workflow)
- [Enterprise Architecture](#-enterprise-architecture)
- [Engineering Milestones](#-engineering-milestones)
- [Comprehensive API Reference](#-comprehensive-api-reference)
- [Installation & Setup](#-installation--setup)
- [Environment Variables](#-environment-variables)
- [Project Directory System](#-project-directory-system)
- [Future Scale Roadmap](#-future-scale-roadmap)

---

## 🎯 Overview

**EVALIX AI** is an advanced exam assessment ecosystem built to eliminate academic grading fatigue while preserving strict quality baselines. 

Traditional Optical Character Recognition (OCR) systems routinely fail when reading overlapping student diagrams, mathematical equations, or rapid cursive handwriting. EVALIX AI replaces fragile legacy approaches with a **Multimodal Spatial LLM Pipeline** powered by Google Gemini 2.5 Pro/Flash and custom external automation agents (e.g., n8n). 

> [!IMPORTANT]
> **Instructor Sovereignty** remains the central pillar of the platform. AI acts as an accelerator, producing granular scorecards, question-by-question strengths/weaknesses, and viva suggestions, while instructors retain complete single-click authority to manually review and override scores.

---

## ✨ Core Value Propositions

- 📝 **Spatial Handwriting Extraction:** Direct vision-based reasoning parses messy student response files effortlessly, eliminating legacy OCR transcription drops.
- ⚡ **Asynchronous Webhook Pipeline:** Hand over complex scoring workflows to external grading agents (such as **n8n**) via secure webhooks for enterprise scalability.
- 🔒 **Tamper-Proof Time-Locks:** Cryptographic timestamps guarantee students cannot read assignments prior to active window boundaries or access analytical scorecards before designated release schedules.
- 👩‍🏫 **Split-Screen HITL Console:** Side-by-side visualization of student artifacts, gold-standard model answers, and AI confidence parameters to facilitate effortless grading validation.
- 🧠 **Dynamic AI Test Paper Setting:** Generate comprehensive examination documents directly from unstructured syllabus inputs and Past Year Questions (PYQs), with immediate export to Excel (`.xlsx`).

---

## 🔄 System Workflow

```text
[ Instructor Creates Assignment ] ──( Model Answers + Time-Locks )
               │
               ▼
[ Student Uploads Response ]      ──( Images, Diagrams, or Selected MCQs )
               │
               ▼
[ Pipeline Router Decides ]
       ├── Local AI Processing    ──► [ Gemini Vision OCR ] ──► [ AI Evaluator Agent ]
       └── External Agent Hook    ──► [ Trigger n8n Webhook ] ──► [ REST Result Receiver ]
               │
               ▼
[ Split-Screen HITL Console ]     ──► ( Instructor Inspects & Overrides / Approves )
               │
               ▼
[ Time-Lock Expiration ]          ──► [ Student Accesses Comprehensive Analytics ]
```

---

## 🏗️ Enterprise Architecture

EVALIX AI deploys a fully decoupled client-server pattern designed for extreme fault-tolerance and asynchronous execution.

```text
┌──────────────────────────────────────────────────────────┐
│                 React 19 + Vite 8 Client                 │
│  - Tailwind CSS 4 Glassmorphic Interface                 │
│  - Dynamic Routing, Split-Screen Grading Dashboard       │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼ Secure REST / JSON
┌──────────────────────────────────────────────────────────┐
│                  Node.js + Express 5 API                 │
│  - High-Concurrency API Key Pool Rotation Engine         │
│  - ACID-Compliant Transaction Pipelines                  │
└──────┬─────────────────────┬──────────────────────┬──────┘
       │                     │                      │
       ▼                     ▼                      ▼
┌──────────────┐     ┌──────────────┐     ┌────────────────┐
│ Supabase JS  │     │ n8n Agent    │     │ Gemini SDK     │
│ Auth/Storage │     │ Webhooks     │     │ Vision / Text  │
└──────────────┘     └──────────────┘     └────────────────┘
       │                     │                      │
       └─────────────────────┼──────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│               PostgreSQL Database (Prisma)               │
│  - Flattened Relations, Optimized Direct Indexing        │
└──────────────────────────────────────────────────────────┘
```

---

## 🛡️ Engineering Milestones

### 1. The Multimodal Vision Leap
Legacy OCR utilities rely on strict font baselines, rendering them useless against handwritten organic chemistry structures, algorithmic layouts, or scanned perspective skews. By directly feeding base64 image strings to **Gemini 2.5 Flash** with precise contextual guardrails, we completely bypassed traditional text parsing stages to extract intent directly from layout geometry.

### 2. High-Concurrency API Pool Rotation
To prevent enterprise quota blockades during high-volume batch evaluation cycles, the architecture implements a round-robin rotation layer (`KeyRotationManager`). The pool consumes multiple comma-separated API keys, automatically advancing rotation indexes upon hitting concurrency limits while preserving single-key fallback support.

### 3. Asynchronous n8n Webhook Architecture
We decoupled complex evaluation tasks by establishing outbound trigger endpoints and receiving webhooks (`/api/webhooks/n8n/grading-result`). This allows external enterprise workflow systems to consume answers asynchronously, evaluate them using deep agentic routing, and persist updates atomically within our main Prisma schema.

---

## 🖧 Comprehensive API Reference

All protected endpoints enforce JSON Web Token (JWT) verification via `requireAuth`. Role-based operations utilize `requireStudent` or `requireTeacher` middleware to guarantee boundary isolation.

### Authentication & Authorization
| Method | Endpoint | Role | Purpose |
|:---|:---|:---|:---|
| **POST** | `/api/auth/sync` | Authenticated | Synchronizes Supabase JWT profiles into the central PostgreSQL User schema. |

### Assignment Management
| Method | Endpoint | Role | Purpose |
|:---|:---|:---|:---|
| **POST** | `/api/assignments` | Teacher | Configures a new assignment matrix including descriptive queries, rubrics, and time windows. |
| **GET** | `/api/assignments/student` | Student | Retrieves all assignments targeted to the caller's specific academic department and cohort. |
| **GET** | `/api/assignments/:id` | Authenticated | Retrieves assignment structure (automatically masks Model Answers if accessed by an active student). |

### Grading & Verification Triggers
| Method | Endpoint | Role | Purpose |
|:---|:---|:---|:---|
| **POST** | `/api/submissions/submit` | Student | Persists user responses. Dispatches live auto-grading for MCQs or background evaluation pipelines. |
| **POST** | `/api/teacher/submissions/:subId/trigger-n8n` | Teacher | Dispatches submission structures to external n8n grading webhooks for asynchronous evaluation. |
| **PATCH** | `/api/teacher/submissions/:subId/answers/:ansId/override`| Teacher | Applies definitive instructor scores and metadata feedback, overriding initial AI determinations. |
| **PATCH** | `/api/teacher/submissions/:subId/answers/:ansId/approve`| Teacher | Authorizes automated evaluation suggestions, updating status parameters atomically. |

### External Webhook Handlers
| Method | Endpoint | Authorization | Purpose |
|:---|:---|:---|:---|
| **POST** | `/api/webhooks/n8n/grading-result` | Webhook Secret | Atomic callback receiver consumed by external grading workflows to persist calculated scorecards. |

---

## 🚀 Installation & Setup

### Requirements
- **Node.js** (v18.x or higher)
- **PostgreSQL** instance
- **Supabase** account (Auth and Storage Buckets fully provisioned)
- **Google Gemini API Key** (Single or multiple comma-separated strings)

### Step 1: Repository Initialization
```bash
git clone https://github.com/anirbanjana883/EVALIX-AI.git
cd EVALIX-AI
```

### Step 2: Backend Core Configuration
```bash
cd backend
npm install

# Instantiate local environment variables
cp .env.example .env

# Generate strongly-typed Prisma client definitions
npx prisma generate

# Apply stateful schema migrations to target PostgreSQL DB
npx prisma db push
```

### Step 3: Frontend Client Setup
```bash
cd ../frontend
npm install

# Prepare local environment parameters
cp .env.example .env
```

---

## ⚙️ Environment Variables

### Backend Configuration (`backend/.env`)
```env
# Relational Database Connections
DATABASE_URL="postgresql://postgres:password@localhost:5432/evaluator"
DIRECT_URL="postgresql://postgres:password@localhost:5432/evaluator"

# AI Inference Keys (Support single key or comma-separated load-balanced pool)
GEMINI_API_KEYS="key_1,key_2,key_3"
GEMINI_API_KEY="fallback_single_key"

# Storage & Authentication Providers
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# External Webhook Framework
N8N_WEBHOOK_SECRET="super_secure_shared_secret"
N8N_GRADING_WEBHOOK_URL="https://your-n8n-domain/webhook/grading-trigger"

# Runtime Bound
PORT=3000
```

### Frontend Configuration (`frontend/.env`)
```env
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
VITE_API_URL="http://localhost:3000"
```

---

## 📁 Project Directory System

```text
EVALIX-AI/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma                 # Relational PostgreSQL definition matrix
│   ├── src/
│   │   ├── agents/                       # Specialized Prompting & Vision abstractions
│   │   │   ├── dualConsensusAgent.js     # Parallel model scoring consensus
│   │   │   ├── generatorAgent.js         # Intelligent paper setter copilot
│   │   │   └── ocrAgent.js               # Handwriting structural vision mapper
│   │   ├── controllers/                  # Route traffic delegators
│   │   │   ├── teacher.controller.js     # Core instructor operations & HITL triggers
│   │   │   └── webhook.controller.js     # External agent ingestion handlers
│   │   ├── middlewares/                  # Security pipelines (RBAC & auth keys)
│   │   ├── repositories/                 # Unified persistence dispatchers
│   │   ├── routes/                       # Express routing nodes
│   │   ├── services/                     # Background AI pipelines & system logging
│   │   └── utils/
│   │       └── keyManager.js             # High-concurrency rotation framework
│   └── app.js                            # Express core assembly pipeline
│
└── frontend/
    ├── src/
    │   ├── components/                   # Reusable interface primitives
    │   ├── context/                      # React global context providers
    │   ├── pages/                        # Feature view components
    │   │   ├── CreateAssignment.jsx      # Test generation console
    │   │   ├── ResultsView.jsx           # Student visual telemetry
    │   │   └── SubmissionReview.jsx      # Split-screen validation grader
    │   ├── App.css                       # Scoped functional styles
    │   └── index.css                     # Primary visual design utility layer
    └── vite.config.js                    # Optimized build target directives
```

---

## 🔮 Future Scale Roadmap

While currently optimized for academic K-12 and collegiate evaluation, our decoupled pipeline is engineered to transition natively into ultra-high-stakes competitive frameworks:

### 🏛️ Public Service Assessments (UPSC)
- **Deep Qualitative Scoring:** Context-aware rubrics capable of assessing multidimensional perspectives, analytical integrity, and socio-ethical reasoning across multi-page handwritten submissions.
- **Dynamic Context Augmentation (RAG):** Grounding evaluation frameworks against real-time global economic data indexes and current affairs records.

### 📐 Engineering Entrance Metrics (JEE)
- **Methodology & Step Tracking:** Moving beyond outcome verification to evaluate multi-stage derivation accuracy across complex dynamic systems.
- **Algorithmic Graph Scoring:** Vision layers optimized to parse and evaluate hand-drawn free-body vectors, circuit schemas, and organic molecular transitions.

### 🧬 Medical Framework Scaling (NEET)
- **High-Velocity Hybrid Engines:** Blending immediate sub-millisecond Optical Mark Recognition (OMR) calculations with detailed descriptive verification models for newly launched theoretical modules.

---

<p align="center">
  <small>© 2025 EVALIX AI. Engineered for performance, compliance, and academic integrity.</small>
</p>