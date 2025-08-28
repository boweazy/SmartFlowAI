#!/usr/bin/env bash
set -e

echo "==========================================="
echo "🚀 SmartFlowAI Ultimate Master Setup Script"
echo "==========================================="

# -------------------------------
# Step 1: Verify critical secrets
# -------------------------------
required=(JWT_SECRET DATABASE_URL OPENAI_API_KEY RENDER_API_KEY RENDER_SERVICE_ID)

echo "🔑 Checking environment variables..."
for key in "${required[@]}"; do
  value=$(printenv $key || true)
  if [[ -z "$value" ]]; then
    echo "❌ $key is missing!"
    exit 1
  fi
  echo "✅ $key is set"
done

# -------------------------------
# Step 2: Fix invalid route syntax
# -------------------------------
echo "🛠 Fixing invalid routes in server/routes..."
for f in server/routes/*.ts; do
  sed -i 's/router.get("(.*)",[[:space:]]*authenticateToken[[:space:]]*,[[:space:]]*/router.get("\1", authenticateToken, /' "$f" || true
done

# -------------------------------
# Step 3: Reset server/index.ts
# -------------------------------
echo "📦 Resetting server/index.ts with working bootstrap..."
cat > server/index.ts <<'EOT'
import express from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes";

const app = express();
app.use(express.json());

// ✅ Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    time: new Date().toISOString(),
    env: process.env.NODE_ENV || "unknown",
  });
});

// Register routes
await registerRoutes(app);

const PORT = process.env.PORT || 3000;
const server = createServer(app);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
EOT

# -------------------------------
# Step 4: Ensure registerRoutes is clean
# -------------------------------
echo "📦 Cleaning registerRoutes (remove duplicate server)..."
cat > server/routes/index.ts <<'EOT'
import { Express, Request, Response } from "express";

import authRoutes from "./auth";
import postRoutes from "./posts";
import aiRoutes from "./ai";
import schedulerRoutes from "./scheduler";
import analyticsRoutes from "./analytics";

export async function registerRoutes(app: Express) {
  app.use("/api/auth", authRoutes);
  app.use("/api/posts", postRoutes);
  app.use("/api/ai", aiRoutes);
  app.use("/api/scheduler", schedulerRoutes);
  app.use("/api/analytics", analyticsRoutes);

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
  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: "API route not found" });
  });
}
EOT

# -------------------------------
# Step 5: Clean build + push
# -------------------------------
echo "🧹 Cleaning build..."
rm -rf dist node_modules
npm install
npm run build

echo "📤 Committing & pushing to GitHub..."
git add server/index.ts server/routes/index.ts server/routes/*.ts
git commit -m "Ultimate fix: working server bootstrap, routes cleaned, health check added"
git push origin main

echo "🚀 Triggering Render redeploy..."
curl -s -X POST "https://api.render.com/v1/services/$RENDER_SERVICE_ID/deploys" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"clearCache":false}'

echo "==========================================="
echo "✅ Ultimate Master Script Completed!"
echo "Secrets validated, routes fixed, server bootstrap reset, build pushed, redeploy triggered"
echo "==========================================="
