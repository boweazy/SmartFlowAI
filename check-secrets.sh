#!/usr/bin/env bash
# ================================================
#  Auto-sync Replit JWT_SECRET with Render
# ================================================

# 1. Get JWT_SECRET from Replit (current env)
REPLIT_SECRET=$(printenv JWT_SECRET)

# 2. Get JWT_SECRET from Render (you must export before running)
#    export RENDER_JWT_SECRET="the_value_from_Render_dashboard"
RENDER_SECRET=$RENDER_JWT_SECRET

echo "🔍 Checking JWT_SECRET sync..."
echo " - Replit JWT_SECRET : $REPLIT_SECRET"
echo " - Render JWT_SECRET : $RENDER_SECRET"

# 3. Compare + auto-fix
if [[ "$REPLIT_SECRET" == "$RENDER_SECRET" ]]; then
  echo "✅ Secrets are already in sync!"
else
  echo "⚠️ Mismatch detected. Updating Replit secret..."
  replit secrets add JWT_SECRET "$RENDER_SECRET"
  echo "✅ Replit JWT_SECRET updated to match Render"
fi
