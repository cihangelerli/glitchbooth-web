import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Analytics } from "@vercel/analytics/react"; // 1. Change /next to /react
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <Analytics /> {/* 2. Mount the component inside your global root wrapper */}
  </StrictMode>,
);
