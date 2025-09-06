import bcrypt from "bcryptjs";
import pg from "pg";

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
async function run() {
  await client.connect();
  const email = "test@smartflow.ai";
  const password = await bcrypt.hash("password123", 10);

  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT now()
    )
  `);

  await client.query(
    `INSERT INTO users (email, password) VALUES ($1,$2)
     ON CONFLICT (email) DO NOTHING`,
    [email, password]
  );

  console.log("✅ Seeded test user:");
  console.log(`   Email: ${email}`);
  console.log(`   Password: password123`);

  await client.end();
}
run().catch(err => { console.error("❌ Seeding failed:", err); process.exit(1); });
