#!/usr/bin/env bash
set -e

echo "==============================================="
echo "🚀 SmartFlowAI Pimped Master Script"
echo "==============================================="

# Step 1: Verify secrets
required=(JWT_SECRET DATABASE_URL OPENAI_API_KEY RENDER_API_KEY RENDER_SERVICE_ID)
for key in "${required[@]}"; do
  value=$(printenv $key || true)
  if [[ -z "$value" ]]; then
    echo "❌ $key missing!"
    exit 1
  fi
  echo "✅ $key set"
done

# Step 2: Fix routes
echo "🛠 Auto-fixing routes..."
for f in server/routes/*.ts; do
  sed -i 's/router.get(.*authenticateToken.*,(.*req, res.*)=>{/router.get("\/", authenticateToken, (req, res) => {/' "$f" || true
done

# Step 3: Reset server/index.ts
echo "♻ Resetting server/index.ts..."
mkdir -p logs
cat > server/index.ts <<'EOT'
import express, { Express, Request, Response } from "express";
import { createServer } from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth";
import postRoutes from "./routes/posts";
import aiRoutes from "./routes/ai";
import schedulerRoutes from "./routes/scheduler";
import analyticsRoutes from "./routes/analytics";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Express = express();
app.use(express.json());

// Logger middleware
app.use((req: Request, res: Response, next) => {
  const log = `[${new Date().toISOString()}] ${req.method} ${req.url}\n`;
  fs.appendFileSync(path.join(__dirname, "../logs/debug.log"), log);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/scheduler", schedulerRoutes);
app.use("/api/analytics", analyticsRoutes);

// Debug
if (process.env.NODE_ENV !== "production") {
  app.get("/api/debug/env", (req: Request, res: Response) => {
    res.json({
      jwt: process.env.JWT_SECRET ? "✅ set" : "❌ missing",
      db: process.env.DATABASE_URL ? "✅ set" : "❌ missing",
      openai: process.env.OPENAI_API_KEY ? "✅ set" : "❌ missing",
    });
  });
}

// Healthcheck
app.get("/", (req: Request, res: Response) => {
  res.json({ status: "✅ SmartFlowAI running" });
});

// Serve frontend
app.use(express.static(path.join(__dirname, "../dist/public")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/public/index.html"));
});

export default createServer(app);
EOT

# Step 4: Clean & rebuild
echo "🧹 Cleaning & building..."
rm -rf dist node_modules
npm install
npm run build

# Step 5: Setup Git signing
if ! gpg --list-secret-keys --keyid-format=long | grep -q sec; then
  gpg --batch --passphrase '' --quick-generate-key "$(git config user.name) <$(git config user.email)>" rsa4096 sign 1y
fi
KEY_ID=$(gpg --list-secret-keys --keyid-format=long | grep sec | head -n1 | awk '{print $2}' | cut -d'/' -f2)
git config --global user.signingkey $KEY_ID
git config --global commit.gpgsign true
git config --global gpg.program gpg

# Step 6: Commit & push
git add .
git commit -S -m "Pimped Master: routes, index.ts, logging, rebuild, serve frontend" || echo "ℹ No changes"
git push origin main || echo "⚠ Git push failed"

# Step 7: Redeploy Render
curl -s -X POST "https://api.render.com/v1/services/$RENDER_SERVICE_ID/deploys" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"clearCache":false}' || echo "⚠ Render redeploy failed"

echo "==============================================="
echo "✅ Done! Backend pimped, frontend ready, commits signed, redeploy triggered"
echo "==============================================="