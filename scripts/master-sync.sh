#!/usr/bin/env bash
set -euo pipefail
trap 'echo "❌ Error on line $LINENO. Exiting."' ERR

echo "🔥 SmartFlowAI Master Sync + Auto Fix Starting..."

########################################
# 1. Environment Setup
########################################
echo "📦 Step 1: Writing .env"
JWT_SECRET=${JWT_SECRET:-$(openssl rand -hex 32)}
OPENAI_API_KEY=${OPENAI_API_KEY:-your-openai-key}

# ⚡ Update this with your Neon DB string
DATABASE_URL=${DATABASE_URL:-"postgresql://neondb_owner:npg_x5mFkEzcq9NW@ep-raspy-frog-admiz5uf-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"}

STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY:-your-stripe-secret}
SMTP_PASSWORD=${SMTP_PASSWORD:-your-smtp-pass}

cat > .env <<EOF
JWT_SECRET=$JWT_SECRET
OPENAI_API_KEY=$OPENAI_API_KEY
DATABASE_URL=$DATABASE_URL
STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY
SMTP_PASSWORD=$SMTP_PASSWORD
EOF
echo "✅ .env created"

########################################
# 2. Patch configs for aliases + Replit host
########################################
echo "📦 Step 2: Patching configs"

# tsconfig.json
node - <<'NODE'
const fs=require('fs'),p='client/tsconfig.json';
if(fs.existsSync(p)){
  let j=JSON.parse(fs.readFileSync(p,'utf8'));
  j.compilerOptions=j.compilerOptions||{};
  j.compilerOptions.baseUrl=".";
  j.compilerOptions.paths=Object.assign(j.compilerOptions.paths||{},{"@/*":["src/*"]});
  fs.writeFileSync(p,JSON.stringify(j,null,2));
  console.log("✅ Patched tsconfig.json");
}
NODE

# vite.config.ts
node - <<'NODE'
const fs=require('fs'),p='client/vite.config.ts';
if(fs.existsSync(p)){
  let s=fs.readFileSync(p,'utf8');
  if(!s.includes("alias:{ '@'")){
    s=s.replace(/defineConfig\(\s*\{/, 
      `defineConfig({\n  resolve:{ alias:{ '@': fileURLToPath(new URL('./src', import.meta.url)) } },`);
  }
  if(!s.includes("server:")) {
    s=s.replace(/defineConfig\(\{/, "defineConfig({\n  server:{host:true,allowedHosts:['.replit.dev']},");
  }
  fs.writeFileSync(p,s);
  console.log("✅ Patched vite.config.ts for alias + allowedHosts");
}
NODE

########################################
# 3. Restore missing UI/lib files
########################################
echo "📦 Step 3: Restoring missing UI/lib files"

mkdir -p client/src/lib client/src/hooks client/src/components/ui

cat > client/src/lib/utils.ts <<'EOF'
export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}
EOF

cat > client/src/hooks/use-toast.ts <<'EOF'
import { useState, useCallback } from "react";

export function useToast() {
  const [toasts, setToasts] = useState<{ id: string; message: string }[]>([]);

  const addToast = useCallback((message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return { toasts, addToast };
}
EOF

cat > client/src/components/ui/toast.tsx <<'EOF'
import React from "react";

export function Toast({ message }: { message: string }) {
  return (
    <div className="bg-gray-800 text-white px-4 py-2 rounded shadow-md">
      {message}
    </div>
  );
}
EOF

cat > client/src/components/ui/toaster.tsx <<'EOF'
import React from "react";
import { Toast } from "./toast";
import { useToast } from "@/hooks/use-toast";

export function Toaster() {
  const { toasts } = useToast();
  return (
    <div className="fixed bottom-4 right-4 space-y-2">
      {toasts.map((t) => (
        <Toast key={t.id} message={t.message} />
      ))}
    </div>
  );
}
EOF
echo "✅ UI/lib files restored"

########################################
# 4. Install deps + build
########################################
echo "📦 Step 4: Installing deps + building frontend"
cd client
npm install
npm run build || echo "⚠️ Frontend build failed, check above logs"
cd ..

echo "📦 Step 5: Building backend"
npm run build || echo "⚠️ Backend build failed, check above logs"

########################################
# 5. Push + Deploy
########################################
echo "📦 Step 6: Git push + Render redeploy"
git add .
git commit -m "chore: master sync auto-fix" || true
git push origin main || true

if [[ -n "${RENDER_API_KEY:-}" && -n "${RENDER_SERVICE_ID:-}" ]]; then
  curl -s -X POST \
    -H "Authorization: Bearer $RENDER_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"clearCache":true}' \
    "https://api.render.com/v1/services/$RENDER_SERVICE_ID/deploys" \
    >/dev/null && echo "✅ Render redeploy triggered"
else
  echo "⚠️ Skipped Render deploy (missing keys)"
fi

########################################
echo "🎉 Master Sync + Auto Fix Complete"
