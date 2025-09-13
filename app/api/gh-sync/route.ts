import crypto from "crypto";

export async function POST(req: Request) {
  const raw = await req.text();

  // Verify GitHub HMAC webhook
  const sig = req.headers.get("x-hub-signature-256") ?? "";
  const secret = process.env.SYNC_TOKEN ?? "";
  const h = "sha256=" + crypto.createHmac("sha256", secret).update(raw).digest("hex");
  const okHmac = !!sig && !!secret && (()=>{try{
    return crypto.timingSafeEqual(Buffer.from(h), Buffer.from(sig));
  }catch{return false}})();

  // Verify CI Bearer token
  const okBearer = (req.headers.get("authorization") ?? "") === `Bearer ${process.env.REPLIT_TOKEN}`;

  if (!okHmac && !okBearer) return new Response("nope", { status: 401 });

  console.log("[SFS] Deploy", raw);
  return Response.json({ status: "ok" });
}