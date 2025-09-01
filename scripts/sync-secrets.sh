#!/bin/bash
set -e

echo "🔐 Syncing secrets between Render and Replit..."

# === STEP 0: Generate a fresh JWT_SECRET ===
NEW_JWT_SECRET=$(openssl rand -hex 32)
echo "✨ Generated new JWT_SECRET: $NEW_JWT_SECRET"

# === CONFIGURATION ===
# Fill in your permanent keys here:
MASTER_OPENAI_API_KEY="sk-your-openai-key"
MASTER_DATABASE_URL="postgres://user:password@host:5432/dbname"
MASTER_STRIPE_SECRET_KEY="sk_test_your-stripe-key"

# Render setup
SERVICE_ID="srv-d2l01pruibrs73enu6u0"   # replace with your real Render service ID
RENDER_API="https://api.render.com/v1"

# === STEP 1: Write local .env ===
cat > .env <<EOF
JWT_SECRET=$NEW_JWT_SECRET
OPENAI_API_KEY=$MASTER_OPENAI_API_KEY
DATABASE_URL=$MASTER_DATABASE_URL
STRIPE_SECRET_KEY=$MASTER_STRIPE_SECRET_KEY
EOF
echo "✅ .env written locally"

# === STEP 2: Write .env.example with placeholders ===
cat > .env.example <<'EOF'
# === SmartFlowAI Environment Variables ===
JWT_SECRET=changeme_secret
OPENAI_API_KEY=sk-your-openai-key
DATABASE_URL=postgres://user:password@host:5432/dbname
STRIPE_SECRET_KEY=sk_test_your-stripe-key
EOF
echo "✅ .env.example updated"

# === STEP 3: Push to Replit Secrets (if CLI installed) ===
if command -v replit >/dev/null 2>&1; then
  replit secrets set JWT_SECRET "$NEW_JWT_SECRET"
  replit secrets set OPENAI_API_KEY "$MASTER_OPENAI_API_KEY"
  replit secrets set DATABASE_URL "$MASTER_DATABASE_URL"
  replit secrets set STRIPE_SECRET_KEY "$MASTER_STRIPE_SECRET_KEY"
  echo "✅ Replit secrets updated"
else
  echo "⚠️ Replit CLI not installed. Install with: npm install -g replit"
fi

# === STEP 4: Push to Render ===
if [ -z "$RENDER_API_KEY" ]; then
  echo "⚠️ Skipping Render sync (set RENDER_API_KEY in your Replit secrets)"
else
  echo "➡️ Syncing secrets to Render service: $SERVICE_ID"
  curl -s -X PATCH "$RENDER_API/services/$SERVICE_ID/env-vars" \
    -H "Authorization: Bearer $RENDER_API_KEY" \
    -H "Content-Type: application/json" \
    -d '[
      {"key":"JWT_SECRET","value":"'"$NEW_JWT_SECRET"'"},
      {"key":"OPENAI_API_KEY","value":"'"$MASTER_OPENAI_API_KEY"'"},
      {"key":"DATABASE_URL","value":"'"$MASTER_DATABASE_URL"'"},
      {"key":"STRIPE_SECRET_KEY","value":"'"$MASTER_STRIPE_SECRET_KEY"'"}
    ]'
  echo
  echo "✅ Render secrets updated"

  # === STEP 5: Trigger Render Deploy ===
  echo "🚀 Triggering Render redeploy..."
  curl -s -X POST "$RENDER_API/services/$SERVICE_ID/deploys" \
    -H "Authorization: Bearer $RENDER_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"clearCache":true}'
  echo
  echo "✅ Render redeploy triggered"
fi

# === STEP 6: Commit .env.example for repo users ===
git add .env.example
git commit -m "chore: update .env.example with latest template" || true
git push origin main || true

echo "🎉 Secrets synced, JWT_SECRET rotated, and Render redeploy triggered!"
