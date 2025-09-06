import { useState, useCallback } from "react";

export function useToast() {
  const [toasts, setToasts] = useState<{ id: string; message: string }[]>([]);

  const addToast = useCallback((message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return { toasts, addToast };
}
