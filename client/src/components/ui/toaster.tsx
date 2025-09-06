import React from "react";
import { Toast } from "./toast";
import { useToast } from "@/hooks/use-toast";

export function Toaster() {
  const { toasts } = useToast();
  return (
    <div className="fixed bottom-4 right-4 space-y-2">
      {toasts.map((t) => (
        <Toast key={t.id} message={t.message} />
      ))}
    </div>
  );
}
