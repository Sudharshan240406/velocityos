"use client";

import React, { useEffect, useState } from "react";
import { Download, RefreshCw, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PWAManager() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  const [updateExists, setUpdateExists] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          // Check for updates on register
          if (registration.waiting) {
            setWaitingWorker(registration.waiting);
            setUpdateExists(true);
          }

          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  setWaitingWorker(newWorker);
                  setUpdateExists(true);
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error("Service worker registration failed:", error);
        });

      // 2. Capture install prompt
      window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        setInstallPrompt(e);
        setShowInstallBtn(true);
      });

      // 3. Register Sync if supported
      navigator.serviceWorker.ready.then((registration) => {
        if ("sync" in registration) {
          (registration as any).sync.register("sync-focusos-stats").catch((err: any) => {
            console.error("Background sync registration failed:", err);
          });
        }
      });
    }
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setShowInstallBtn(false);
    }
    setInstallPrompt(null);
  };

  const handleUpdateClick = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
      setUpdateExists(false);
      window.location.reload();
    }
  };

  return (
    <div className="fixed bottom-16 right-4 z-[99] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {/* Install Prompt Toast */}
        {showInstallBtn && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="pointer-events-auto flex items-center gap-3 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-2.5 shadow-lg max-w-[280px]"
          >
            <Download className="w-4 h-4 text-purple-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-white block">Install FocusOS</span>
              <span className="text-[8px] text-gray-400 block leading-tight">Add to home screen for desktop experience.</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleInstallClick}
                className="px-2 py-1 bg-purple-500 hover:bg-purple-600 text-black font-black text-[9px] uppercase tracking-wider rounded transition"
              >
                Install
              </button>
              <button
                onClick={() => setShowInstallBtn(false)}
                className="p-1 text-gray-500 hover:text-white transition"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Update Notification Toast */}
        {updateExists && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="pointer-events-auto flex items-center gap-3 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-2.5 shadow-lg max-w-[280px]"
          >
            <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin [animation-duration:6s] shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-white block">Update Available</span>
              <span className="text-[8px] text-gray-400 block leading-tight">A newer version of FocusOS is ready.</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleUpdateClick}
                className="px-2 py-1 bg-emerald-500 hover:bg-emerald-600 text-black font-black text-[9px] uppercase tracking-wider rounded transition"
              >
                Reload
              </button>
              <button
                onClick={() => setUpdateExists(false)}
                className="p-1 text-gray-500 hover:text-white transition"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
