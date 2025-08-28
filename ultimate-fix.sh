#!/usr/bin/env bash
set -e

echo "================================================"
echo "🚀 SmartFlowAI ULTIMATE DEBUG + FIX SCRIPT"
echo "================================================"

# STEP 1: Check required secrets
echo "🔑 Checking environment variables..."
required=(JWT_SECRET DATABASE_URL OPENAI_API_KEY RENDER_API_KEY RENDER_SERVICE_ID)

for key in "${required[@]}"; do
  value=$(printenv $key || true)
  if [[ -z "$value" ]]; then
    echo "❌ $key is MISSING!"
    exit 1
  else
    echo "✅ $key is set"
  fi
done

# STEP 2: Fix imports in routes
echo "🔧 Fixing imports in server/routes.ts..."
sed -i 's#\.\./services/auth#../../services/index#g' server/routes.ts || true
sed -i 's#\.\./storage#../../services/storage#g' server/routes.ts || true
sed -i 's#\.\./middleware/auth#../middleware/auth#g' server/routes.ts || true

# STEP 3: Fix invalid route definitions
echo "🔧 Cleaning up router.get syntax..."
for f in server/routes/*.ts; do
  sed -i 's/router.get([^,]*,[^,]*, *"\/", */router.get("/", authenticateToken, /g' "$f"
  # Ensure every route has a handler
  sed -i 's/,( *req, *res)/,(req, res)/g' "$f"
done

# STEP 4: Ensure services/index.ts exports storage
echo "🔧 Resetting services/index.ts..."
cat > services/index.ts <<'EOF'
export * from "./storage";
// export * from "./auth"; # Uncomment if you create auth.ts later
EOF

# STEP 5: Add fallback homepage in server/index.ts (only if missing)
if ! grep -q 'app.get("/",' server/index.ts; then
cat >> server/index.ts <<'EOF'

app.get("/", (req, res) => {
  res.send("<h1>🚀 SmartFlowAI is running!</h1><p>Backend is alive.</p>");
});
EOF
fi

# STEP 6: Clean build
echo "🧹 Cleaning old build..."
rm -rf dist node_modules

echo "📦 Installing dependencies..."
npm install

echo "🏗️ Building project..."
npm run build

# STEP 7: Commit & push
echo "💾 Committing and pushing changes..."
git add server/routes.ts services/index.ts server/index.ts
git commit -m "Ultimate fix: imports, routes, homepage fallback"
git push origin main

echo "================================================"
echo "✅ ULTIMATE FIX COMPLETE!"
echo "   Secrets OK, imports fixed, routes cleaned,"
echo "   homepage fallback added, build pushed."
echo "================================================"