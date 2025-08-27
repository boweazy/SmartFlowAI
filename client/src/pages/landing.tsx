export default function Landing() {
  const features = [
    {
      title: "AI Content Generation",
      desc: "Generate engaging posts with GPT-4o and DALL·E 3.",
    },
    {
      title: "Multi-Platform Scheduling",
      desc: "Automate posting across Instagram, Twitter, LinkedIn & Facebook.",
    },
    {
      title: "Advanced Analytics",
      desc: "Track engagement, reach, and performance with AI insights.",
    },
    {
      title: "White-Label Capabilities",
      desc: "Tenant branding, custom domains, and tailored experiences.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hero */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-20 text-center">
        <h1 className="text-5xl font-bold">SmartFlow AI</h1>
        <p className="mt-4 text-xl">
          The AI-powered social media management platform
        </p>
        <a
          href="/login"
          className="mt-8 inline-block bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg shadow hover:bg-gray-100 transition"
        >
          Login to Get Started
        </a>
      </header>

      {/* Features */}
      <section className="flex-1 container mx-auto py-16 px-6 grid md:grid-cols-2 gap-10">
        {features.map((f, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
          >
            <h2 className="text-2xl font-bold text-blue-600">{f.title}</h2>
            <p className="mt-2 text-gray-700">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-6 text-center">
        <p>© {new Date().getFullYear()} SmartFlow AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
