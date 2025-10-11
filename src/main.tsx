import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error('Failed to find root element');

// Unregister Service Workers and clear caches in Lovable preview or dev
if ('serviceWorker' in navigator) {
  const isLovable = /lovable\.(dev|app|project\.com)$/.test(location.hostname) || location.hostname.includes('lovable');
  if (import.meta.env.DEV || isLovable) {
    navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister()));
    if ('caches' in window) {
      caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
    }
  }
}

createRoot(rootElement).render(
  <StrictMode>
    <AuthProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </AuthProvider>
  </StrictMode>
);