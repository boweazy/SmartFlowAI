#!/usr/bin/env bash
set -e

# ============================================================
# 🚀 SmartFlowAI Master Health Check & Deploy (with auto-fix)
# ============================================================

echo ""
echo "🔍 Running SmartFlowAI Master Check + Auto-Fix"
echo ""

# ----------------------------
# Step 1: Sync secrets
# ----------------------------
echo "🔑 Step 1: Syncing secrets..."
./sync-secrets.sh || echo "⚠️ Secret sync failed, check logs."

# ----------------------------
# Step 2: Verify environment variables
# ----------------------------
echo ""
echo "✅ Step 2: Verifying environment variables..."
REQUIRED=("JWT_SECRET" "DATABASE_URL" "OPENAI_API_KEY" "RENDER_API_KEY" "RENDER_SERVICE_ID")
for key in "${REQUIRED[@]}"; do
  value=$(printenv $key || true)
  if [[ -z "$value" ]]; then
    echo "❌ $key is missing!"
    exit 1
  else
    echo "✅ $key is set"
  fi
done

# ----------------------------
# Step 3: Auto-fix invalid router.get() definitions
# ----------------------------
echo ""
echo "🛠 Step 3: Auto-fixing invalid route definitions..."
for f in server/routes/*.ts; do
  echo "   -> Cleaning $f"
  sed -i 's/, *"\/"//g' "$f"
done
echo "✅ All routes cleaned."

# ----------------------------
# Step 4: Local build check
# ----------------------------
echo ""
echo "⚙️ Step 4: Running local build check..."
npm install
npm run build

# ----------------------------
# Step 5: Commit & push changes
# ----------------------------
echo ""
echo "📦 Step 5: Committing and pushing changes..."
git add .
git commit -m "Master auto-fix + health check" || echo "ℹ️ Nothing to commit"
git push origin main

# ----------------------------
# Step 6: Trigger Render redeploy
# ----------------------------
echo ""
echo "🚀 Step 6: Triggering Render redeploy..."
curl -s -X POST "https://api.render.com/v1/services/$RENDER_SERVICE_ID/deploys" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"clearCache":false}'

echo ""
echo "✅ Master check completed! App redeploy triggered 🚀"