"use client";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";

type Toast = { id: number; message: string; type: "success" | "error" | "info" };
type Ctx = { push: (message: string, type?: Toast["type"]) => void };

const ToastCtx = createContext<Ctx>({ push: () => {} });

export function useToast() {
  return useContext(ToastCtx);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-[min(360px,calc(100vw-2.5rem))] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex animate-scale-in items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-card ${
              t.type === "success"
                ? "border-emerald-200 bg-white text-emerald-800"
                : t.type === "error"
                  ? "border-red-200 bg-white text-red-700"
                  : "border-slate-200 bg-white text-navy-800"
            }`}
          >
            <Icon name={t.type === "error" ? "close" : "check"} size={17} className="mt-0.5 shrink-0" strokeWidth={2.4} />
            <span className="flex-1">{t.message}</span>
            <button
              type="button"
              onClick={() => setToasts((list) => list.filter((x) => x.id !== t.id))}
              className="text-slate-400 transition hover:text-navy-900"
              aria-label="Cerrar aviso"
            >
              <Icon name="close" size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
