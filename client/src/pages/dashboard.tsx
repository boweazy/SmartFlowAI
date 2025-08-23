import React from "react";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-dark text-white">
      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 p-4 flex justify-between items-center">
        <h1 className="text-2xl font-heading text-primary">SmartFlowAI</h1>
        <div className="space-x-4">
          <a href="/dashboard" className="text-gray-300 hover:text-primary">
            Dashboard
          </a>
          <a href="/settings" className="text-gray-300 hover:text-primary">
            Settings
          </a>
          <button className="secondary px-4 py-2">Logout</button>
        </div>
      </nav>

      {/* Dashboard Content */}
      <main className="p-8">
        <h2 className="text-3xl font-heading text-primary mb-6">Dashboard</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* AI Post Generator */}
          <div className="card">
            <h3 className="text-xl font-heading mb-2">AI Post Generator</h3>
            <p className="text-gray-400 mb-4">
              Generate smart social media posts with AI.
            </p>
            <button className="primary w-full">Generate Post</button>
          </div>

          {/* Analytics */}
          <div className="card">
            <h3 className="text-xl font-heading mb-2">Analytics</h3>
            <p className="text-gray-400 mb-4">
              Track engagement, impressions, and reach.
            </p>
            <button className="secondary w-full">View Reports</button>
          </div>

          {/* Scheduling */}
          <div className="card">
            <h3 className="text-xl font-heading mb-2">Scheduling</h3>
            <p className="text-gray-400 mb-4">
              Plan and automate your content delivery.
            </p>
            <button className="accent w-full">Schedule Post</button>
          </div>
        </div>
      </main>
    </div>
  );
}
