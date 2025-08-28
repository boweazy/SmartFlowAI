#!/usr/bin/env bash
set -e

# 🚀 SmartFlowAI Master Health Check & Deploy (with route fixes)

echo ""
echo "🛠️ Running SmartFlowAI Master Check..."
echo ""

# Step 1: Sync secrets
echo "🔑 Step 1: Syncing secrets..."
./sync-secrets.sh || echo "⚠️ Secret sync failed, check logs."

# Step 2: Verify critical env vars
echo ""
echo "✅ Step 2: Verifying environment variables..."
REQUIRED=("JWT_SECRET" "DATABASE_URL" "OPENAI_API_KEY" "RENDER_API_KEY" "RENDER_SERVICE_ID")
for key in "${REQUIRED[@]}"; do
  if [[ -z "$(printenv $key)" ]]; then
    echo "❌ $key is missing!"
    exit 1
  else
    echo "✅ $key is set"
  fi
done

# Step 3: Fix invalid route definitions
echo ""
echo "🛠️ Step 3: Fixing invalid route definitions..."
for f in server/routes/*.ts; do
  sed -i 's/, *"\//"/g' "$f"
done
echo "✅ All routes cleaned."

# Step 4: Local build check
echo ""
echo "🔨 Step 4: Running local build check..."
rm -rf dist node_modules
npm install
npm run build

# Step 5: Commit & push any changes
echo ""
echo "📦 Step 5: Committing and pushing changes..."
git add server/routes
git commit -m "Fix: auto-clean routes + rebuild" || echo "ℹ️ Nothing to commit"
git push origin main

# Step 6: Trigger Render redeploy
echo ""
echo "🚀 Step 6: Triggering Render redeploy..."
SERVICE_ID=$RENDER_SERVICE_ID
curl -s -X POST "https://api.render.com/v1/services/$SERVICE_ID/deploys" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"clearCache":false}'

echo ""
echo "✅ Master check completed! App redeploy triggered 🚀"
