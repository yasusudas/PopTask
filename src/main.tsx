import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./auth/AuthContext";
import { SyncProvider } from "./sync/SyncContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <SyncProvider>
        <App />
      </SyncProvider>
    </AuthProvider>
  </StrictMode>,
);
