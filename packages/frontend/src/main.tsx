import React from "react";
import ReactDOM from "react-dom/client";
import { Buffer } from "buffer";
import App from "@/App";
import "@/index.css";

// Polyfill Buffer for browser environment
declare global {
  interface Window {
    Buffer: typeof Buffer;
  }
}

window.Buffer = window.Buffer || Buffer;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
