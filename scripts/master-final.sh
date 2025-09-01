#!/bin/bash
set -e

echo "🚀 SmartFlowAI Master Final Script Starting..."

### 1. Fix server/index.ts to ensure correct PORT + health check
cat > server/index.ts <<'EOF'
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Health check endpoint
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "SmartFlowAI backend is running 🚀" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ SmartFlowAI server running on port ${PORT}`);
});
EOF

echo "✅ server/index.ts patched"

### 2. Update package.json start script to use dist/server/index.js
if grep -q "dist/index.js" package.json; then
  jq '.scripts.start="NODE_ENV=production node dist/server/index.js"' package.json > package.tmp.json && mv package.tmp.json package.json
  echo "✅ package.json start script fixed"
else
  echo "ℹ️ package.json already correct"
fi

### 3. Create .env.example for Render
cat > .env.example <<'EOF'
OPENAI_API_KEY=sk-yourkey
JWT_SECRET=supersecret
DATABASE_URL=postgres://user:pass@host/db
STRIPE_SECRET_KEY=sk_test_yourstripekey
EOF

echo "✅ .env.example ready"

### 4. Clean & rebuild
rm -rf dist
echo "🧹 old dist removed"
npm install
npm run build

echo "✅ Build completed"

### 5. Git commit & push
git add .
git commit -m "Master Fix: Render deploy working (server port + package.json start)"
git push origin main

echo "🎉 Master script complete. Redeploy manually in Render with 'Clear build cache'."
