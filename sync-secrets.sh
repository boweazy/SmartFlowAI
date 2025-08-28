#!/usr/bin/env bash
# ========================================
# Auto-sync critical environment variables
# Between Render and Replit
# ========================================

# 1. Define which secrets you care about
SECRETS=("JWT_SECRET" "DATABASE_URL" "OPENAI_API_KEY")

# 2. Loop through each secret
for KEY in "${SECRETS[@]}"; do
  echo "🔍 Checking $KEY ..."

  # Get Replit value (from env)
  REPLIT_VAL=$(printenv $KEY)

  # Get Render value (must export before running)
  RENDER_VAL=$(printenv RENDER_$KEY)

  if [[ -z "$RENDER_VAL" ]]; then
    echo "⚠️  Please export RENDER_$KEY before running!"
    echo "   export RENDER_$KEY=the_value_from_Render_dashboard"
    continue
  fi

  # Compare
  if [[ "$REPLIT_VAL" == "$RENDER_VAL" ]]; then
    echo "✅ $KEY is in sync."
  else
    echo "❌ $KEY mismatch detected!"
    echo "   Replit: $REPLIT_VAL"
    echo "   Render: $RENDER_VAL"
    echo "   ➡️ Updating Replit secret..."
    replit secrets add $KEY "$RENDER_VAL"
    echo "   ✅ Replit $KEY updated to match Render."
  fi

  echo
done