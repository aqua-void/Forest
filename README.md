# Forest
AI-powered crop disease prediction and prevention platform. Detects, forecasts, and protects farms before outbreaks occur.


# Backend README

## Overview

This is the backend service built using **FastAPI**. It provides APIs for handling various operations including AI model interactions, data processing, and integration with Groq services.

---

## 🚀 Tech Stack

* **FastAPI**
* **Uvicorn**
* **Torch**
* **Torchvision**
* **Pillow**
* **NumPy**
* **Matplotlib**
* **TQDM**
* **python-multipart**
* **pydantic-settings**
* **pytest** / **pytest-asyncio**
* **python-dotenv**
* **Requests**
* **Groq SDK**

---

## 📁 Project Setup

### 1️⃣ Clone the repository

```bash
git clone <YOUR_REPO_URL>
cd backend
```

### 2️⃣ Create and activate virtual environment

```bash
python -m venv venv
source venv/bin/activate   # macOS/Linux
venv\Scripts\activate      # Windows
```

### 3️⃣ Install dependencies

```bash
pip install -r requirements.txt
```

---

## 🔐 Environment Variables

Create a `.env` file inside the backend folder:

```env
GROQ_API_KEY=""
```

> ⚠️ **Do NOT expose API keys publicly in production.**

---

## ▶️ Running the Backend Server

Start the FastAPI server using Uvicorn:

```bash
uvicorn main:app --reload
```

The API will run at:

```
http://localhost:8000
```

---

# Frontend README

## Overview

This is the frontend built using **Next.js**, connected with **Supabase**, **OpenRouter**, and custom backend APIs.

---

## ⚙️ Tech Stack

* **Next.js** (App Router)
* **TailwindCSS**
* **Supabase**
* **OpenRouter API**
* **VAPI**

---

## 📁 Project Setup

### 1️⃣ Clone the repository

```bash
git clone <YOUR_REPO_URL>
cd frontend
```

### 2️⃣ Install dependencies

```bash
npm install
```

---

## 🔐 Environment Variables

Create a `.env.local` file in the frontend folder:

```env
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""

OPENROUTER_API_KEY=""

NEXT_PUBLIC_HOST_URL=http://localhost:3000/interview
NEXT_PUBLIC_VAPI_PUBLIC_KEY=""
NEXT_PUBLIC_DASBORAD_URL=http://localhost:3000/dashboard

# Mode Configuration
NEXT_PUBLIC_MOCK_MODE=true
NEXT_PUBLIC_ENABLE_SUPABASE_UPLOAD=false

# Backend Configuration
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

> ⚠️ **Never commit `.env.local` to GitHub for production.**

---

## ▶️ Running the Frontend

```bash
npm run dev
```

The app will start at:

```
http://localhost:3000
```

---

## 📦 Build for Production

```bash
npm run build
npm start
```

---

## ✅ Notes

* Ensure backend is running before using frontend APIs.
* Replace placeholder URLs when deploying.

---

### ✨ You're all set! Let me know if you want badges, diagrams, or GitHub workflow setup.
