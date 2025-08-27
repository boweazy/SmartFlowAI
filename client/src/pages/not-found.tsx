import React from "react";
import { Link } from "wouter";
import { AlertCircle } from "lucide-react";
import logo from "@/assets/logo.png"; // ⚡ replace with your actual logo path

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      {/* Logo */}
      <div className="flex items-center mb-6 space-x-2">
        <img src={logo} alt="SmartFlowAI Logo" className="h-10 w-10" />
        <h1 className="text-2xl font-bold text-gray-800">SmartFlowAI</h1>
      </div>

      {/* Card */}
      <div className="bg-white shadow-2xl rounded-2xl p-10 text-center max-w-md border border-gray-200">
        <div className="flex justify-center mb-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-3">404</h1>
        <p className="text-gray-600 mb-6 text-lg">
          Oops! The page you’re looking for doesn’t exist.
        </p>

        {/* Primary CTA */}
        <Link href="/login">
          <button className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow transition">
            Go back to Login
          </button>
        </Link>

        {/* Secondary CTA */}
        <p className="mt-6 text-sm text-gray-500">
          Or head back to{" "}
          <Link href="/">
            <span className="text-indigo-600 underline cursor-pointer hover:text-indigo-800">
              SmartFlowAI Home
            </span>
          </Link>
        </p>
      </div>
    </div>
  );
}