import { useEffect, useState } from "react";
import { useNavigate } from "wouter";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Fetch user profile
    async function fetchUser() {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      const data = await res.json();
      setUser(data);
    }

    fetchUser();
  }, [navigate]);

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Header */}
      <header className="p-4 flex justify-between items-center border-b border-gray-700">
        <h1 className="text-xl font-bold text-[var(--primary)]">SmartFlowAI Dashboard</h1>
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm">{user.email}</span>
            <button
              onClick={handleLogout}
              className="bg-[var(--accent)] hover:bg-yellow-600 px-3 py-1 rounded-md text-sm"
            >
              Logout
            </button>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Posts */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-2 text-[var(--primary)]">📢 Posts</h2>
          <p className="text-sm text-gray-300">Manage and create your AI-powered posts.</p>
          <button
            onClick={() => alert("Posts feature coming soon")}
            className="mt-4 w-full bg-[var(--primary)] hover:bg-blue-700 text-white py-2 rounded"
          >
            Open Posts
          </button>
        </div>

        {/* Scheduler */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-2 text-[var(--secondary)]">⏰ Scheduler</h2>
          <p className="text-sm text-gray-300">Plan, schedule, and automate your content.</p>
          <button
            onClick={() => alert("Scheduler feature coming soon")}
            className="mt-4 w-full bg-[var(--secondary)] hover:bg-green-700 text-black py-2 rounded"
          >
            Open Scheduler
          </button>
        </div>

        {/* Analytics */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-2 text-[var(--accent)]">📊 Analytics</h2>
          <p className="text-sm text-gray-300">Track engagement and measure performance.</p>
          <button
            onClick={() => alert("Analytics feature coming soon")}
            className="mt-4 w-full bg-[var(--accent)] hover:bg-yellow-600 text-black py-2 rounded"
          >
            Open Analytics
          </button>
        </div>
      </main>
    </div>
  );
}
