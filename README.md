# Guires Marketing Control Center (v2.5.0)

## Setup Instructions

1.  **Database Setup:**
    *   Ensure PostgreSQL is running.
    *   Create a database named `mcc_db`.
    *   Run the schema script:
        ```bash
        psql -U postgres -d mcc_db -f backend/db/schema.sql
        ```

2.  **Environment Variables:**
    *   Navigate to `backend/`.
    *   Copy `.env.example` to `.env`.
    *   Update `DB_PASSWORD` and `API_KEY` (Google Gemini).

3.  **Install Dependencies:**
    *   Root: `npm install`
    *   Backend: `cd backend && npm install`

4.  **Run Application:**
    *   From the root directory:
        ```bash
        npm run dev
        ```
    *   This starts the Frontend (Vite) on port 5173 and Backend (Express) on port 3001.

## Architecture
*   **Frontend:** React, Tailwind CSS, Recharts
*   **Backend:** Node.js, Express, Socket.io, PostgreSQL
*   **AI:** Google Gemini (via @google/genai SDK)
