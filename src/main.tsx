import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import { I18nextProvider } from "react-i18next";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import 'leaflet/dist/leaflet.css';

import App from "./App";
import i18n from "./lib/i18n";
import "./index.css";

/**
 * Environment checks & helpful debug messages
 */
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

console.log("Environment Variables:", {
  NODE_ENV: import.meta.env.MODE,
  DEV: import.meta.env.DEV,
  VITE_CLERK_PUBLISHABLE_KEY: PUBLISHABLE_KEY ? "✅ Set" : "❌ Missing",
  VITE_API_URL: import.meta.env.VITE_API_URL || "Not set",
});

if (!PUBLISHABLE_KEY) {
  // Show a clear actionable error in console and throw to avoid starting the app in a broken state
  const msg = [
    "🔴 Missing Clerk Publishable Key (VITE_CLERK_PUBLISHABLE_KEY).",
    "Please ensure you have a .env file in the project root with:",
    "  VITE_CLERK_PUBLISHABLE_KEY=pk_XXXXXXXXXXXXX",
    "Then restart the dev server.",
    `Current NODE_ENV: ${import.meta.env.MODE}`,
  ].join("\n");
  console.error(msg);
  throw new Error("Missing Clerk publishable key. See console for details.");
}

/**
 * React Query client (app-level)
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

/**
 * Mount React app
 */
const container = document.getElementById("root");
if (!container) {
  throw new Error("Failed to find the root element (#root)");
}

const root = createRoot(container);

// Render the app
root.render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </QueryClientProvider>
      </I18nextProvider>
    </ClerkProvider>
  </StrictMode>
);

/**
 * Extra developer logs (only in dev)
 */
if (import.meta.env.DEV) {
  console.log("Dev mode: environment info", {
    mode: import.meta.env.MODE,
    dev: import.meta.env.DEV,
    prod: import.meta.env.PROD,
    baseUrl: import.meta.env.BASE_URL,
    apiUrl: import.meta.env.VITE_API_URL || "Not set",
  });
}