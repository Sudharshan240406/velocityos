"use client";

import { useEffect, useState } from "react";

export function PWARegister() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const handleControllerChange = () => {
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);

    void navigator.serviceWorker.register("/sw.js").then((reg) => {
      if (!reg) return;

      if (reg.waiting) {
        setWaitingWorker(reg.waiting);
        setShowPrompt(true);
      }

      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        if (!newWorker) return;

        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed") {
            if (navigator.serviceWorker.controller) {
              setWaitingWorker(newWorker);
              setShowPrompt(true);
            }
          }
        });
      });
    });

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
    };
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
    }
    setShowPrompt(false);
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 max-w-sm rounded-[24px] border border-white/10 bg-slate-900/90 p-4 text-white shadow-2xl backdrop-blur-md md:bottom-6">
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-sm font-semibold">Update Available</p>
          <p className="mt-1 text-xs text-white/60">A new version of VelocityOS is ready. Reload to update.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleUpdate}
            className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-slate-950 hover:bg-white/90"
          >
            Update
          </button>
          <button
            type="button"
            onClick={() => setShowPrompt(false)}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/80 hover:bg-white/10"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
