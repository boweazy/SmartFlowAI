########################################
# 3. Frontend setup (workspace-safe)
########################################
echo "🎨 Setting up frontend (workspace-safe)..."
mkdir -p client
cd client

if [ ! -f package.json ]; then
  npm init -y
fi

# Check for workspace:* dependencies
if grep -q "workspace:" package.json || grep -q "workspace:" ../package.json 2>/dev/null; then
  echo "⚡ Workspace dependencies detected — using pnpm..."
  npm install -g pnpm
  pnpm install --no-frozen-lockfile || {
    echo "⚠️ pnpm failed, stripping workspace:* deps..."
    sed -i 's/"workspace:\*"/"latest"/g' package.json
    pnpm install --no-frozen-lockfile
  }
else
  echo "📦 Installing frontend deps with npm..."
  npm install react react-dom
  npm install -D vite typescript @types/react @types/react-dom \
    tailwindcss postcss autoprefixer @tailwindcss/typography @tailwindcss/forms
  npm install shadcn/ui lucide-react framer-motion class-variance-authority clsx
fi

# Tailwind setup
if [ ! -f tailwind.config.js ] && [ ! -f tailwind.config.ts ]; then
  npx tailwindcss init -p
fi

cat > tailwind.config.ts <<EOF
import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../shared/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")],
}
export default config
EOF

mkdir -p src

if [ ! -f src/App.tsx ]; then
cat > src/App.tsx <<EOF
import { Button } from "shadcn/ui/button"

export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-10 text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">🚀 SmartFlowAI Frontend</h1>
        <p className="text-gray-600">Your modern AI-powered dashboard is ready.</p>
        <Button>Get Started</Button>
      </div>
    </div>
  )
}
EOF
fi

echo "✅ Frontend setup done"
cd ..
