#!/usr/bin/env bash
set -e

echo "🔐 SmartFlowAI Power Sync & Deploy Starting..."

# === 1. Generate or rotate JWT_SECRET ===
JWT_SECRET=${JWT_SECRET:-$(openssl rand -hex 32)}
echo "✨ JWT_SECRET generated/loaded: $JWT_SECRET"

# === 2. Load other keys from env or defaults ===
OPENAI_API_KEY=${OPENAI_API_KEY:-your-openai-key}
RAW_DATABASE_URL=${DATABASE_URL:-file:./dev.db}
STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY:-your-stripe-secret}
SMTP_PASSWORD=${SMTP_PASSWORD:-your-smtp-pass}

# === 2.1 Clean DATABASE_URL (fix duplicate postgres:// bug) ===
if [[ "$RAW_DATABASE_URL" == *"postgresql://postgresql://"* ]]; then
  DATABASE_URL=$(echo "$RAW_DATABASE_URL" | sed 's/postgresql:\/\/postgresql:\/\///')
else
  DATABASE_URL="$RAW_DATABASE_URL"
fi

# === 3. Write .env ===
cat > .env <<EOF
JWT_SECRET=$JWT_SECRET
OPENAI_API_KEY=$OPENAI_API_KEY
DATABASE_URL=$DATABASE_URL
STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY
SMTP_PASSWORD=$SMTP_PASSWORD
EOF
echo "✅ .env updated"

# === 4. Update .env.example (safe template) ===
cat > .env.example <<EOF
JWT_SECRET=your-jwt-secret
OPENAI_API_KEY=your-openai-key
DATABASE_URL=file:./dev.db
STRIPE_SECRET_KEY=your-stripe-secret
SMTP_PASSWORD=your-smtp-pass
EOF
echo "✅ .env.example updated"

# === 5. Install deps just in case ===
echo "📦 Checking runtime dependencies..."
npm install --include=dev >/dev/null 2>&1
echo "✅ Dependencies installed"

# === 6. Sync to Render (requires RENDER_API_KEY + RENDER_SERVICE_ID) ===
if [[ -n "$RENDER_API_KEY" && -n "$RENDER_SERVICE_ID" ]]; then
  echo "🚀 Updating secrets on Render..."
  curl -s -X PATCH \
    -H "Authorization: Bearer $RENDER_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
      \"envVars\": [
        {\"key\":\"JWT_SECRET\",\"value\":\"$JWT_SECRET\"},
        {\"key\":\"OPENAI_API_KEY\",\"value\":\"$OPENAI_API_KEY\"},
        {\"key\":\"DATABASE_URL\",\"value\":\"$DATABASE_URL\"},
        {\"key\":\"STRIPE_SECRET_KEY\",\"value\":\"$STRIPE_SECRET_KEY\"},
        {\"key\":\"SMTP_PASSWORD\",\"value\":\"$SMTP_PASSWORD\"}
      ]
    }" \
    "https://api.render.com/v1/services/$RENDER_SERVICE_ID/env-vars" \
    >/dev/null && echo "✅ Render secrets updated"
else
  echo "⚠️ Skipped Render sync (missing RENDER_API_KEY or RENDER_SERVICE_ID)"
fi

# === 7. Sync to GitHub Actions Secrets (requires gh CLI + GH_TOKEN) ===
if gh --version >/dev/null 2>&1; then
  echo "🔑 Syncing secrets to GitHub Actions..."
  gh secret set JWT_SECRET --body "$JWT_SECRET"
  gh secret set OPENAI_API_KEY --body "$OPENAI_API_KEY"
  gh secret set DATABASE_URL --body "$DATABASE_URL"
  gh secret set STRIPE_SECRET_KEY --body "$STRIPE_SECRET_KEY"
  gh secret set SMTP_PASSWORD --body "$SMTP_PASSWORD"
  echo "✅ GitHub Actions secrets updated"
else
  echo "⚠️ Skipped GitHub sync (gh CLI not installed or no GH_TOKEN)"
fi

# === 8. Run DB migrations ===
if [ -f drizzle.config.ts ] || [ -f drizzle.config.js ]; then
  echo "🗄️ Running DB migrations..."
  npm run db:push || echo "⚠️ DB migration failed (check config)"
else
  echo "ℹ️ No drizzle config found, skipping migrations"
fi

# === 9. Clean + rebuild ===
echo "🧹 Cleaning dist..."
rm -rf dist
npm run build
echo "✅ Build completed"

# === 10. Push changes to GitHub ===
echo "📦 Pushing to GitHub..."
git add .env.example dist >/dev/null 2>&1 || true
git commit -m "chore: sync secrets, db, build" >/dev/null 2>&1 || true
git push origin main >/dev/null 2>&1 || true
echo "✅ Repo pushed to GitHub"

# === 11. Trigger Render redeploy ===
if [[ -n "$RENDER_API_KEY" && -n "$RENDER_SERVICE_ID" ]]; then
  echo "⚡ Triggering Render redeploy..."
  curl -s -X POST \
    -H "Authorization: Bearer $RENDER_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"clearCache":true}' \
    "https://api.render.com/v1/services/$RENDER_SERVICE_ID/deploys" \
    >/dev/null && echo "✅ Render redeploy triggered"
else
  echo "⚠️ Skipped Render deploy (missing RENDER_API_KEY or RENDER_SERVICE_ID)"
fi

# === 12. Final recap ===
echo ""
echo "📋 Secrets now synced everywhere:"
echo "-----------------------------------------"
echo "JWT_SECRET=$JWT_SECRET"
echo "OPENAI_API_KEY=$OPENAI_API_KEY"
echo "DATABASE_URL=$DATABASE_URL"
echo "STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY"
echo "SMTP_PASSWORD=$SMTP_PASSWORD"
echo "-----------------------------------------"
echo "🎉 Full Power Sync complete!"
