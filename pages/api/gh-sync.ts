import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const sig = (req.headers["x-hub-signature-256"] as string) || "";
  const secret = process.env.SYNC_TOKEN || "";
  const raw = JSON.stringify(req.body || {});
  const h = "sha256=" + crypto.createHmac("sha256", secret).update(raw).digest("hex");
  const okHmac = sig && secret && (()=>{try{
    return crypto.timingSafeEqual(Buffer.from(h), Buffer.from(sig));
  }catch{return false}})();

  const okBearer = (req.headers.authorization || "") === `Bearer ${process.env.REPLIT_TOKEN}`;

  if (!okHmac && !okBearer) return res.status(401).send("nope");

  console.log("[SFS] Deploy", req.body);
  res.json({ status: "ok" });
}
