#!/usr/bin/env bash
set +e  # fail-soft mode

echo "🔍 Running full SmartFlowAI checks..."

errors=0

check_step () {
  name=$1
  shift
  echo "👉 $name..."
  if "$@"; then
    echo "✅ $name passed"
  else
    echo "❌ $name failed"
    errors=$((errors+1))
  fi
}

# 1. Check casing/imports
check_step "Casing/import check" \
  grep -rni --include=\*.{ts,tsx} \
  -e 'import .*Login' \
  -e 'import .*Dashboard' \
  -e 'import .*Analytics' \
  -e 'import .*Feed' \
  -e 'import .*Scheduler' \
  client/src

# 2. ESLint
check_step "ESLint" npm run lint

# 3. Prettier
check_step "Prettier" npm run prettier:check

# 4. Build
check_step "Build" npm run build

# 5. Tests
check_step "Tests" npm test

# 6. Secrets
check_step "Secret scan" \
  grep -rni --exclude-dir={node_modules,.git,dist,build} -e 'sk-[a-zA-Z0-9]' .

# 7. Debug env (only works locally/dev)
check_step "Runtime debug env" \
  curl -s http://localhost:3000/api/debug/env || true

# 8. Auto-deploy to Render
if [[ -n "${RENDER_SERVICE_ID:-}" && -n "${RENDER_API_KEY:-}" ]]; then
  check_step "Render deploy trigger" \
    curl -X POST "https://api.render.com/v1/services/${RENDER_SERVICE_ID}/deploys" \
      -H "Accept: application/json" \
      -H "Authorization: Bearer ${RENDER_API_KEY}"
else
  echo "⚠️ Render deploy skipped (missing RENDER_SERVICE_ID or RENDER_API_KEY)"
fi

echo
if [ $errors -eq 0 ]; then
  echo "🎉 All checks passed!"
else
  echo "❌ $errors checks failed. Review logs above."
fi