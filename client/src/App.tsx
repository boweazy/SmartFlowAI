import { motion } from "framer-motion";

function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
      <motion.h1
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-5xl font-bold"
      >
        🚀 SmartFlowAI
      </motion.h1>
      <p className="mt-4 text-lg opacity-80">Next-gen AI Automation Suite</p>
    </div>
  );
}

export default App;
