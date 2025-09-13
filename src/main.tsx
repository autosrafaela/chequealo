import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "@/contexts/AuthContext";
import NotificationSystem from "@/components/NotificationSystem";
import { PWAInstallPrompt, IOSInstallInstructions } from "@/components/PWAInstallPrompt";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
      <NotificationSystem />
      <PWAInstallPrompt />
      <IOSInstallInstructions />
    </AuthProvider>
  </React.StrictMode>
);