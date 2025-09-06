import { Button } from "../components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center p-6">
        <h1 className="text-2xl font-bold">SmartFlowAI</h1>
        <nav>
          <ul className="flex gap-6">
            <li><a href="/login" className="hover:underline">Login</a></li>
            <li><a href="/register" className="hover:underline">Sign Up</a></li>
          </ul>
        </nav>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col justify-center items-center text-center px-6">
        <h2 className="text-5xl font-extrabold mb-4">Automate. Scale. Flow.</h2>
        <p className="max-w-2xl text-lg mb-6">
          Your all-in-one AI-powered automation suite — manage agents, chat, analytics, and scheduling in one place.
        </p>
        <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
          Get Started
        </Button>
      </main>

      {/* Features */}
      <section className="bg-white text-gray-900 py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <h3 className="text-xl font-semibold mb-2">AI Agents</h3>
            <p>Deploy smart AI agents for tasks, support, and growth.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Analytics</h3>
            <p>Track engagement and performance in real-time.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Automation</h3>
            <p>Schedule posts and workflows seamlessly across platforms.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-sm opacity-75">
        © {new Date().getFullYear()} SmartFlowAI. All rights reserved.
      </footer>
    </div>
  );
}