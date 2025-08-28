#!/usr/bin/env bash
set -e

echo "=========================================="
echo " 🚀 SmartFlowAI Master Health Check & Deploy"
echo "=========================================="

# Step 1: Sync secrets
echo ""
echo "🔑 Step 1: Syncing secrets..."
./sync-secrets.sh || echo "⚠️ Secret sync failed, check logs."

# Step 2: Verify critical env vars
echo ""
echo "🔍 Step 2: Verifying environment variables..."
REQUIRED=("JWT_SECRET" "DATABASE_URL" "OPENAI_API_KEY")
for KEY in "${REQUIRED[@]}"; do
  if [ -z "$(printenv $KEY)" ]; then
    echo "❌ $KEY is missing!"
    exit 1
  else
    echo "✅ $KEY is set"
  fi
done

# Step 3: Build check
echo ""
echo "🛠 Step 3: Running local build check..."
npm install
npm run build

# Step 4: Commit & push any changes
echo ""
echo "📦 Step 4: Committing and pushing changes..."
git add .
git commit -m "Master check auto-update" || echo "ℹ️ Nothing to commit"
git push origin main || echo "ℹ️ Nothing to push"

# Step 5: Trigger Render redeploy via API
echo ""
echo "🔄 Step 5: Triggering Render redeploy..."
if [ -z "$RENDER_API_KEY" ]; then
  echo "❌ Missing RENDER_API_KEY!"
  exit 1
fi
if [ -z "$RENDER_SERVICE_ID" ]; then
  echo "❌ Missing RENDER_SERVICE_ID!"
  exit 1
fi

curl -s -X POST "https://api.render.com/v1/services/$RENDER_SERVICE_ID/deploys" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"clearCache":false}' \
  && echo "✅ Redeploy triggered successfully" \
  || echo "❌ Redeploy failed"

echo ""
echo "=========================================="
echo " 🎯 Master check completed!"
echo "=========================================="