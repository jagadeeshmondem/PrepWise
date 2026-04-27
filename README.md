# 🤖 AI Interview Coach System

An intelligent placement preparation system with 8 specialized AI agents for personalized mock interviews, coding guidance, analytics, and structured learning plans.

---

## 📋 Prerequisites

- **Python 3.10+** — [Download](https://www.python.org/downloads/)
- **Node.js 18+** — [Download](https://nodejs.org/)
- **Google Gemini API Key** — [Get free key](https://aistudio.google.com/apikey)

---

## 🚀 How to Run (Step by Step)

### Step 1: Clone / Open the project

Open a terminal and navigate to the project folder:
```
cd C:\Users\Jagadeesh Mondem\Desktop\ai_hackathon
```

---

### Step 2: Set up the Backend

Open **Terminal 1** (for the backend):

```bash
# Navigate to backend folder
cd backend

# Install Python dependencies (one-time)
pip install -r requirements.txt

# Set your Gemini API key in the .env file
# Open backend/.env and set:
# GEMINI_API_KEY=your_actual_api_key_here

# Start the Flask server
python app.py
```

✅ You should see:
```
 * Running on http://127.0.0.1:5000
 * Debugger is active!
```

> ⚠️ The "WARNING: This is a development server" message is **normal** — it's not an error.

---

### Step 3: Set up the Frontend

Open **Terminal 2** (keep Terminal 1 running):

```bash
# Navigate to frontend folder
cd frontend

# Install Node dependencies (one-time)
npm install

# Start the React dev server
npm run dev
```

✅ You should see:
```
VITE v8.x.x ready in XXX ms
➜  Local: http://localhost:5173/
```

---

### Step 4: Open the App

Open your browser and go to:

### 👉 http://localhost:5173

> **NOT** `127.0.0.1:5000` — that's just the backend API.  
> The frontend at `localhost:5173` is the actual app with the UI.

---

## 🎯 How to Use the App

1. **Upload Resume** → Go to "Resume Analysis" → Upload PDF/DOCX or paste text
2. **Start Interview** → Go to "Mock Interview" → Pick type & difficulty → Start
3. **Answer Questions** → Type your answer → Get instant AI feedback (score, strengths, weaknesses)
4. **View Analytics** → Go to "Analytics" → See your performance trends
5. **Daily Plan** → Go to "Daily Planner" → Generate a personalized study schedule
6. **Coding Practice** → Go to "Coding Practice" → Get DSA problem suggestions
7. **Company Prep** → Go to "Company Prep" → Select a target company for tailored prep

---

## 📁 Project Structure

```
ai_hackathon/
├── backend/                    # Flask API server (port 5000)
│   ├── app.py                  # Main server with all routes
│   ├── .env                    # ← Put your GEMINI_API_KEY here
│   ├── requirements.txt        # Python dependencies
│   └── agents/                 # 8 AI agent modules
│       ├── llm_utils.py        # Gemini API client
│       ├── resume_agent.py     # Resume parsing (NLP)
│       ├── interview_agent.py  # Question generation
│       ├── feedback_agent.py   # Answer evaluation
│       ├── coding_agent.py     # Problem recommendations
│       ├── company_agent.py    # Company-specific RAG
│       ├── planner_agent.py    # Daily study plans
│       └── analytics_agent.py  # Performance tracking
│
└── frontend/                   # React app (port 5173)
    ├── src/
    │   ├── App.jsx             # Main app layout
    │   ├── pages/              # All page components
    │   └── services/api.js     # API calls to backend
    ├── index.html
    └── package.json
```

---

## ❓ Troubleshooting

| Issue | Solution |
|-------|----------|
| `Port 5173 is in use` | Close other terminals running `npm run dev`, or use the new port shown (e.g., 5174) |
| `Port 5000 is in use` | Close other terminals running `python app.py` |
| API calls fail | Make sure backend is running on port 5000 AND your `.env` has a valid API key |
| `Not Found` at `127.0.0.1:5000` | That's expected — open `localhost:5173` instead |
| `WARNING: development server` | Normal Flask debug message, not an error |
