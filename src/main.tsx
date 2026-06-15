import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { inject } from "@vercel/analytics"; // Standard React/Vite import
import "./index.css";

/**
 * VERCEL ANALYTICS INITIALIZATION
 * Tracks page views and performance across the studio website.
 */
inject();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
