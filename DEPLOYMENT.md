# Deploying Hybrid Smart Attendance System to Render

This guide will help you deploy both the backend (Flask) and frontend (React) to Render.

## Prerequisites

- A [GitHub](https://github.com/) account.
- A [Render](https://render.com/) account.
- The project code pushed to a GitHub repository.

---

## Part 1: Deploying the Backend (Web Service)

1.  **Log in to Render** and click **New +** -> **Web Service**.
2.  Connect your GitHub repository.
3.  **Configure the service:**
    -   **Name:** `hybrid-backend` (or similar)
    -   **Region:** Choose the one closest to you.
    -   **Branch:** `main` (or your working branch)
    -   **Root Directory:** `backend`
    -   **Runtime:** `Python 3`
    -   **Build Command:** `pip install -r requirements.txt`
    -   **Start Command:** `gunicorn app:app`
4.  **Environment Variables:**
    -   Scroll down to "Environment Variables" and add:
        -   `PYTHON_VERSION`: `3.10.0` (or similar)
        -   `SECRET_KEY`: (Generate a random string)
        -   `GEMINI_API_KEY`: (Your Gemini API Key)
        -   `DATABASE_URL`: (Render will provide a PostgreSQL database, see below)
5.  **Database (PostgreSQL):**
    -   It is recommended to use a managed PostgreSQL database on Render.
    -   Click **New +** -> **PostgreSQL**.
    -   Name it `hybrid-db`.
    -   Copy the **Internal Database URL**.
    -   Go back to your Backend Web Service -> Environment Variables.
    -   Add `DATABASE_URL` and paste the internal URL.
6.  **Deploy:** Click **Create Web Service**.

**Note:** Once deployed, copy the **Backend URL** (e.g., `https://hybrid-backend.onrender.com`). You will need this for the frontend.

---

## Part 2: Deploying the Frontend (Static Site)

1.  **Log in to Render** and click **New +** -> **Static Site**.
2.  Connect the same GitHub repository.
3.  **Configure the service:**
    -   **Name:** `hybrid-frontend`
    -   **Branch:** `main`
    -   **Root Directory:** `frontend`
    -   **Build Command:** `npm install && npm run build`
    -   **Publish Directory:** `dist`
4.  **Environment Variables:**
    -   Add the following variable so the frontend knows where the backend is:
        -   `VITE_API_URL`: (Paste your Backend URL from Part 1, e.g., `https://hybrid-backend.onrender.com`)
5.  **Deploy:** Click **Create Static Site**.

---

## Part 3: Final Configuration

1.  **CORS Update (Backend):**
    -   Once the frontend is deployed, copy its URL (e.g., `https://hybrid-frontend.onrender.com`).
    -   Go to your **Backend Web Service** -> **Environment Variables**.
    -   Add `FRONTEND_URL`: `https://hybrid-frontend.onrender.com`
    -   *Note:* You might need to update `app.py` to use this env var for CORS if you want strict security. Currently, it allows localhost. For production, it's best to allow the specific frontend URL.

    **Update `backend/app.py` (Optional but Recommended):**
    ```python
    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
    CORS(app, resources={r"/*": {"origins": frontend_url}}, supports_credentials=True)
    ```

2.  **Verify:**
    -   Open your Frontend URL.
    -   Try to login/register.
    -   Check if the API calls are going to the correct backend URL (Network tab in DevTools).

---

## Troubleshooting

-   **Build Failed:** Check the logs. Ensure `requirements.txt` and `package.json` are in the correct folders.
-   **Database Errors:** Ensure `DATABASE_URL` is set correctly in the backend environment variables.
-   **CORS Errors:** Ensure the backend allows requests from the frontend URL.
