import React from "react";
import { Link } from "wouter";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 text-center max-w-md">
        <div className="flex justify-center mb-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">404</h1>
        <p className="text-gray-600 mb-6">
          Oops! The page you’re looking for doesn’t exist.
        </p>

        <Link href="/login">
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition">
            Go back to Login
          </button>
        </Link>

        <p className="mt-4 text-sm text-gray-500">
          Or head to{" "}
          <Link href="/">
            <span className="text-blue-600 underline cursor-pointer">
              SmartFlowAI Home
            </span>
          </Link>
        </p>
      </div>
    </div>
  );
}