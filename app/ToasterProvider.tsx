"use client";
import { Toaster } from "react-hot-toast";

export default function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "#1b2230",
          color: "#e8eef9",
          border: "1px solid #283247",
        },
        success: {
          iconTheme: {
            primary: "#22c55e",
            secondary: "#0f1720",
          },
        },
        error: {
          iconTheme: {
            primary: "#ef4444",
            secondary: "#0f1720",
          },
        },
      }}
    />
  );
}

