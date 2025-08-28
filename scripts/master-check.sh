#!/usr/bin/env bash
set -e

# =====================================================
# 🚀 SmartFlowAI Master Health Check & Deploy
# =====================================================

echo ""
echo "🧪 Running SmartFlowAI Master Check (with validation)"
echo ""

# Step 1: Sync secrets
echo "🔑 Step 1: Syncing secrets..."
./sync-secrets.sh || echo "⚠️ Secret sync failed, check logs."

# Step 2: Verify critical env vars + format checks
echo ""
echo "✅ Step 2: Verifying environment variables..."

check_secret() {
  local key=$1
  local value=$(printenv $key)

  if [[ -z "$value" ]]; then
    echo "❌ $key is missing!"
    exit 1
  fi

  case $key in
    OPENAI_API_KEY)
      [[ $value == sk-* ]] || { echo "❌ $key is invalid (must start with sk-)"; exit 1; }
      ;;
    RENDER_API_KEY)
      [[ $value == rnd_* ]] || { echo "❌ $key is invalid (must start with rnd_)"; exit 1; }
      ;;
    RENDER_SERVICE_ID)
      [[ $value == srv-* ]] || { echo "❌ $key is invalid (must start with srv-)"; exit 1; }
      ;;
  esac

  echo "✅ $key is set correctly"
}

REQUIRED=("JWT_SECRET" "DATABASE_URL" "OPENAI_API_KEY" "RENDER_API_KEY" "RENDER_SERVICE_ID")

for key in "${REQUIRED[@]}"; do
  check_secret $key
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
git commit -m "Master check auto-update" || echo "🗂 Nothing to commit"
git push origin main

# Step 5: Trigger Render redeploy
echo ""
echo "🚀 Step 5: Triggering Render redeploy..."

if [[ -z "$RENDER_API_KEY" || -z "$RENDER_SERVICE_ID" ]]; then
  echo "❌ Missing RENDER_API_KEY or RENDER_SERVICE_ID!"
  exit 1
fi

curl -s -X POST "https://api.render.com/v1/services/$RENDER_SERVICE_ID/deploys" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"clearCache":false}'

echo ""
echo "✅ Master check completed! App redeploy triggered 🚀"