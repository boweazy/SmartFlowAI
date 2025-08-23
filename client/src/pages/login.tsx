import React from "react";

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark">
      <div className="card w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-heading text-primary">SmartFlowAI</h1>
          <p className="text-gray-400">Sign in to your account</p>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-primary focus:ring-2 focus:ring-primary text-white"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-primary focus:ring-2 focus:ring-primary text-white"
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="primary w-full text-center">
            Sign In
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Don’t have an account?{" "}
          <a href="/signup" className="text-secondary hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}

