import { QueryClient } from "@tanstack/react-query";

// Default fetcher for React Query
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// API request helper
export async function apiRequest(url: string, options: RequestInit = {}) {
  const baseUrl = import.meta.env.DEV ? "http://localhost:5000" : "";
  
  const response = await fetch(`${baseUrl}${url}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: `HTTP error! status: ${response.status}`,
    }));
    throw new Error(error.message || "Something went wrong");
  }

  return response.json();
}