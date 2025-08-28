#!/usr/bin/env bash
set -e

echo "====================================="
echo " 🚀 Fixing Routes + Rebuilding + Deploy"
echo "====================================="

# Step 1: Fix invalid route definitions in all server/routes/*.ts
echo "🔧 Fixing invalid router.get syntax..."
for f in server/routes/*.ts; do
  sed -i 's|, "/",||g' "$f"
done

# Step 2: Verify fixes
echo "✅ Routes cleaned:"
grep -R "router.get" server/routes/ || true

# Step 3: Clean & rebuild
echo "🧹 Cleaning old build..."
rm -rf dist node_modules
npm install
npm run build

# Step 4: Commit & push changes
echo "💾 Committing changes to GitHub..."
git add server/routes
git commit -m "Fix router.get syntax (auto-fix)" || echo "ℹ️ Nothing to commit"
git push origin main

echo "====================================="
echo " ✅ All done! GitHub CI/CD will redeploy on Render automatically."
echo "====================================="
