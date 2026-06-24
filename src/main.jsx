import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./app";
import ErrorBoundary from "./components/common/errorboundary";
import { ToastProvider } from "./context/toastcontext";
import { ConfirmProvider } from "./context/confirmcontext";
import { AuthProvider } from "./context/authcontext";
import { CommandProvider } from "./context/commandcontext";

import "./styles/main.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <ToastProvider>
          <ConfirmProvider>
            <AuthProvider>
              <CommandProvider>
                <App />
              </CommandProvider>
            </AuthProvider>
          </ConfirmProvider>
        </ToastProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
