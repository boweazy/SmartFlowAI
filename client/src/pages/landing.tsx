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

  const plans = [
    {
      name: "Basic",
      price: "Free",
      perks: [
        "Up to 10 posts / month",
        "1 connected platform",
        "Basic AI content suggestions",
      ],
    },
    {
      name: "Pro",
      price: "$29/mo",
      perks: [
        "Unlimited posts",
        "3 connected platforms",
        "AI content + image generation",
        "Basic analytics",
      ],
    },
    {
      name: "Premium",
      price: "$79/mo",
      perks: [
        "Unlimited posts",
        "All platforms",
        "AI content + image generation",
        "Advanced analytics + insights",
        "White-label branding",
      ],
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
      <section className="container mx-auto py-16 px-6 grid md:grid-cols-2 gap-10">
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

      {/* Pricing */}
      <section className="bg-gray-100 py-16 px-6">
        <h2 className="text-4xl font-bold text-center text-gray-800">
          Pricing Plans
        </h2>
        <p className="text-center text-gray-600 mt-2">
          Choose the plan that fits your needs
        </p>

        <div className="mt-10 container mx-auto grid md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className="bg-white p-8 rounded-lg shadow hover:shadow-xl transition text-center"
            >
              <h3 className="text-2xl font-bold text-blue-600">{plan.name}</h3>
              <p className="text-3xl font-extrabold mt-2">{plan.price}</p>
              <ul className="mt-4 text-gray-700 space-y-2">
                {plan.perks.map((perk, i) => (
                  <li key={i}>✅ {perk}</li>
                ))}
              </ul>
              <a
                href="/login"
                className="mt-6 inline-block w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Get Started
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-6 text-center">
        <p>© {new Date().getFullYear()} SmartFlow AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
