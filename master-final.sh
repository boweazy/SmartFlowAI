#!/usr/bin/env bash
set -e

echo "============================================"
echo " 🚀 SmartFlowAI Ultimate Master Setup Script"
echo "============================================"

# --------------------------------------------
# Step 1: Verify critical environment secrets
# --------------------------------------------
required=(JWT_SECRET DATABASE_URL OPENAI_API_KEY RENDER_API_KEY RENDER_SERVICE_ID)

echo "🔑 Checking environment variables..."
for key in "${required[@]}"; do
  value=$(printenv $key || true)
  if [[ -z "$value" ]]; then
    echo "❌ $key is missing!"
    exit 1
  fi
  case $key in
    OPENAI_API_KEY)
      [[ $value == sk-* ]] || { echo "❌ OPENAI_API_KEY must start with sk-"; exit 1; }
      ;;
    RENDER_API_KEY)
      [[ $value == rnd_* ]] || { echo "❌ RENDER_API_KEY must start with rnd_"; exit 1; }
      ;;
    RENDER_SERVICE_ID)
      [[ $value == srv-* ]] || { echo "❌ RENDER_SERVICE_ID must start with srv-"; exit 1; }
      ;;
  esac
  echo "✅ $key is set correctly"
done

# --------------------------------------------
# Step 2: Auto-fix invalid route syntax
# --------------------------------------------
echo "🛠 Fixing invalid routes in server/routes..."
for f in server/routes/*.ts; do
  sed -i 's/router.get(.*authenticateToken.*,(.*req, res.*)=>{/router.get("\/", authenticateToken, (req, res) => {/' "$f" || true
done

# --------------------------------------------
# Step 3: Reset server/index.ts bootstrap
# --------------------------------------------
echo "🔄 Resetting server/index.ts..."
cat > server/index.ts <<'EOT'
import express, { Express, Request, Response } from "express";
import { createServer } from "http";

import authRoutes from "./routes/auth";
import postRoutes from "./routes/posts";
import aiRoutes from "./routes/ai";
import schedulerRoutes from "./routes/scheduler";
import analyticsRoutes from "./routes/analytics";

export async function registerRoutes(app: Express) {
  app.use("/api/auth", authRoutes);
  app.use("/api/posts", postRoutes);
  app.use("/api/ai", aiRoutes);
  app.use("/api/scheduler", schedulerRoutes);
  app.use("/api/analytics", analyticsRoutes);

  // Debug route
  if (process.env.NODE_ENV !== "production") {
    app.get("/api/debug/env", (req: Request, res: Response) => {
      res.json({
        jwt: process.env.JWT_SECRET ? "✅ set" : "❌ missing",
        db: process.env.DATABASE_URL ? "✅ set" : "❌ missing",
        openai: process.env.OPENAI_API_KEY ? "✅ set" : "❌ missing",
      });
    });
  }

  // Catch-all
  app.all("/api/*", (req: Request, res: Response) => {
    res.status(404).json({ error: "API route not found" });
  });

  return createServer(app);
}

// Runtime debug logging
const app = express();
app.use(express.json());
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error("Runtime error:", err);
  res.status(500).json({ error: "Internal server error", details: err.message });
});
EOT

# --------------------------------------------
# Step 4: Rewrite package.json build script
# --------------------------------------------
echo "📝 Fixing package.json build script..."
tmpfile=$(mktemp)
jq '.scripts.build = "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js"' package.json > "$tmpfile" && mv "$tmpfile" package.json

# --------------------------------------------
# Step 5: Ensure logs/debug.log exists
# --------------------------------------------
echo "🗂 Setting up runtime debug logs..."
mkdir -p logs
touch logs/debug.log

# Inject runtime logging into start
tmpfile=$(mktemp)
jq '.scripts.start = "NODE_ENV=production node dist/index.js 2>&1 | tee -a logs/debug.log"' package.json > "$tmpfile" && mv "$tmpfile" package.json

# --------------------------------------------
# Step 6: Clean + rebuild
# --------------------------------------------
echo "🧹 Cleaning and rebuilding..."
rm -rf dist node_modules
npm install
npm run build

ls -R dist

# --------------------------------------------
# Step 7: Commit + push
# --------------------------------------------
echo "📦 Committing changes..."
git add .
git commit -S -m "Ultimate fix: rebuild backend + logging + redeploy"
git push origin main

# --------------------------------------------
# Step 8: Trigger Render redeploy
# --------------------------------------------
echo "🚀 Triggering Render redeploy..."
curl -s -X POST "https://api.render.com/v1/services/$RENDER_SERVICE_ID/deploys" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"clearCache":false}'

echo "============================================"
echo " ✅ Ultimate Master Script Completed!"
echo " Secrets validated, routes fixed, build pushed,"
echo " redeploy triggered, runtime logs saved to logs/debug.log"
echo "============================================"
