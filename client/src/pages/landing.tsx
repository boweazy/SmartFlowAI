import React from "react";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-900">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-extrabold">SmartFlowAI</h1>
        <p className="mt-4 text-lg text-gray-600">
          Automate, Analyze, and Scale your social media with AI-powered flows.
        </p>
      </header>

      <div className="space-x-4">
        <a
          href="/login"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          Get Started
        </a>
        <a
          href="/demo"
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
        >
          See Demo
        </a>
      </div>

      <section className="mt-16 max-w-4xl text-center">
        <h2 className="text-2xl font-semibold mb-4">Why SmartFlowAI?</h2>
        <p className="text-gray-600">
          From scheduling posts to deep analytics, SmartFlowAI helps businesses
          and creators stay ahead with automation and insights.
        </p>
      </section>
    </div>
  );
}
