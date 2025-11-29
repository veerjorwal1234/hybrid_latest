# 🎓 HYBRID Smart Attendance System - Setup Instructions

Welcome! This guide will help you run the Hybrid Smart Attendance System on your computer.

## 📋 Prerequisites

Before you start, make sure you have these installed on your computer:

1. **Python 3.8+** - [Download from python.org](https://www.python.org/downloads/)
   - To check: Open terminal/command prompt and type `python --version` or `python3 --version`

2. **Node.js 16+** - [Download from nodejs.org](https://nodejs.org/)
   - To check: Type `node --version` in terminal

3. **npm** (comes with Node.js)
   - To check: Type `npm --version` in terminal

---

## 🚀 Quick Start Guide

### Step 1: Extract the Project
1. Unzip/Extract the `HYBRID` folder to your desired location
2. Open Terminal (Mac/Linux) or Command Prompt (Windows)
3. Navigate to the project folder:
   ```bash
   cd path/to/HYBRID
   ```

### Step 2: Set Up Backend (Python/Flask)

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment:**
   - **Mac/Linux:**
     ```bash
     python3 -m venv venv
     ```
   - **Windows:**
     ```bash
     python -m venv venv
     ```

3. **Activate the virtual environment:**
   - **Mac/Linux:**
     ```bash
     source venv/bin/activate
     ```
   - **Windows:**
     ```bash
     venv\Scripts\activate
     ```
   
   You should see `(venv)` at the start of your terminal line.

4. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
   This will install Flask, SQLAlchemy, google-generativeai, and other packages.

5. **Initialize the database:**
   ```bash
   python init_db.py
   ```
   This creates the SQLite database with all necessary tables.

6. **Start the backend server:**
   ```bash
   python app.py
   ```
   
   You should see:
   ```
   * Running on http://127.0.0.1:5001
   ```

   **✅ Keep this terminal window open!** The backend server must stay running.

### Step 3: Set Up Frontend (React/Vite)

1. **Open a NEW terminal window** (don't close the backend terminal!)

2. **Navigate to frontend folder:**
   ```bash
   cd path/to/HYBRID/frontend
   ```

3. **Install Node.js dependencies:**
   ```bash
   npm install
   ```
   This might take 2-3 minutes. It will install React, Vite, Axios, and other packages.

4. **Start the frontend development server:**
   ```bash
   npm run dev
   ```
   
   You should see:
   ```
   ➜  Local:   http://localhost:5173/
   ```

   **✅ Keep this terminal window open too!**

### Step 4: Open the Application

1. Open your web browser (Chrome, Firefox, Safari, Edge)
2. Go to: **http://localhost:5173**
3. You should see the login page! 🎉

---

## 📱 Using the Application

### For Students:
1. Click "Student Login" or go to "Student Register" to create an account
2. Login with your roll number and password
3. Click "Scan QR Code" to mark attendance
4. View your attendance history

### For Teachers:
1. Click "Teacher Login" or go to "Teacher Register" to create an account
2. Login with your email and password
3. Click "Generate QR Code" to create a session
4. Define the geofence on the map (classroom boundaries)
5. Students can now scan the QR code
6. View live attendance or generate AI-powered reports

---

## 🔧 Troubleshooting

### Backend Issues:

**Problem:** "Port 5001 is already in use"
- **Solution:** Kill the process using port 5001
  - **Mac/Linux:** `lsof -ti:5001 | xargs kill -9`
  - **Windows:** Open Task Manager → Find Python process → End Task

**Problem:** "No module named 'flask'" or similar
- **Solution:** Make sure you activated the virtual environment and ran `pip install -r requirements.txt`

**Problem:** Database errors
- **Solution:** Delete `instance/attendance.db` and run `python init_db.py` again

### Frontend Issues:

**Problem:** "EADDRINUSE: address already in use :::5173"
- **Solution:** Kill the process using port 5173
  - **Mac/Linux:** `lsof -ti:5173 | xargs kill -9`
  - **Windows:** Open Task Manager → Find Node process → End Task

**Problem:** "Module not found" errors
- **Solution:** Make sure you ran `npm install` in the frontend folder

**Problem:** "Failed to fetch" or API errors
- **Solution:** Make sure the backend server is running on http://localhost:5001

---

## 🔑 Gemini AI Integration (Optional)

If you want to use the AI-powered reports feature:

1. Get a free Gemini API key from: https://aistudio.google.com/app/apikey
2. Open `backend/.env` file
3. Replace the API key:
   ```
   GEMINI_API_KEY=your-new-api-key-here
   ```
4. Restart the backend server

**Note:** The current API key might have quota limits. Get your own for unlimited access!

---

## 🛑 Stopping the Application

1. Press `Ctrl + C` in the **backend terminal** to stop the Flask server
2. Press `Ctrl + C` in the **frontend terminal** to stop the Vite server
3. Deactivate the Python virtual environment (if needed):
   ```bash
   deactivate
   ```

---

## 📂 Project Structure

```
HYBRID/
├── backend/              # Python Flask server
│   ├── app.py           # Main Flask application
│   ├── models.py        # Database models
│   ├── routes/          # API endpoints
│   ├── utils/           # Helper functions
│   ├── .env             # Environment variables (API keys)
│   └── instance/        # SQLite database
│
└── frontend/            # React/Vite application
    ├── src/
    │   ├── pages/       # Login, Dashboard, QR pages
    │   ├── components/  # NavBar, etc.
    │   └── index.css    # Cyberpunk glassmorphism styles
    └── package.json
```

---

## ✨ Features

✅ Student & Teacher authentication  
✅ GPS-based geofence attendance  
✅ QR code generation with expiration  
✅ Real-time attendance tracking  
✅ AI-powered attendance reports (Gemini AI)  
✅ Cyberpunk/Glassmorphism UI design  
✅ Student attendance history  
✅ Live attendance monitoring  

---

## 📞 Need Help?

If you encounter any issues:
1. Check the troubleshooting section above
2. Make sure both servers are running
3. Check browser console for errors (F12 → Console tab)
4. Ensure you're using the correct URLs (http://localhost:5173 for frontend, http://localhost:5001 for backend)

---

## 🎨 Tech Stack

- **Frontend:** React, Vite, React Router, Axios
- **Backend:** Python, Flask, SQLAlchemy, Flask-CORS
- **Database:** SQLite
- **AI:** Google Gemini 2.5 Flash
- **Authentication:** JWT tokens
- **GPS:** Browser Geolocation API

---

**Enjoy using the Smart Attendance System! 🚀**

Last Updated: November 2025
