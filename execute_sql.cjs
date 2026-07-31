const { Client } = require('pg');
const fs = require('fs');

async function main() {
  const sql = fs.readFileSync('supabase_migration_v2.sql', 'utf8');
  const uri = 'postgresql://postgres.wqyfxyzqgtndgmyobxfc:7LdAxuUdt%40da%2F%24g@aws-0-eu-central-1.pooler.supabase.com:6543/postgres';

  const client = new Client({ connectionString: uri, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    console.log('Connected successfully!');
    await client.query(sql);
    console.log('Migration v2 executed successfully!');

    // Verify tables
    const res = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('profiles', 'messages', 'tb_information', 'medication_logs', 'daily_checkins', 'treatment_plans')
      ORDER BY table_name;
    `);
    console.log('Tables found:', res.rows.map(r => r.table_name));

    // Verify RLS enabled
    const rls = await client.query(`
      SELECT tablename, rowsecurity
      FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename IN ('medication_logs', 'daily_checkins', 'treatment_plans');
    `);
    console.log('RLS status:', rls.rows);

    await client.end();
  } catch (e) {
    console.error('Migration failed:', e.message);
    try { await client.end(); } catch(_){}
    process.exit(1);
  }
}

main();
