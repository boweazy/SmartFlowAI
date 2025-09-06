import { useState } from "react";
export function useToast() {
  const [messages, setMessages] = useState<string[]>([]);
  function toast(msg: string) {
    setMessages([...messages, msg]);
    console.log("Toast:", msg);
  }
  return { toast, messages };
}
