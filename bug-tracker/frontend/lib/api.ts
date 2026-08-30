// Central place for the backend API base URL.
// In local dev this falls back to your local FastAPI server.
// In production, set NEXT_PUBLIC_API_URL in your Vercel project
// environment variables to your deployed backend's URL
// (e.g. https://your-backend.onrender.com).
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
