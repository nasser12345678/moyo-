const { Client } = require('pg');
const fs = require('fs');

async function main() {
  const uri = process.env.SUPABASE_DB_URL;
  if (!uri) {
    throw new Error('SUPABASE_DB_URL must be set before running this migration.');
  }

  const client = new Client({ connectionString: uri, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    console.log('Connected successfully!');
    const verifyOnly = process.argv.includes('--verify');
    if (!verifyOnly) {
      const sql = fs.readFileSync('supabase_migration_v2.sql', 'utf8');
      await client.query(sql);
      console.log('Migration v2 executed successfully!');
    }

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

    const policies = await client.query(`
      SELECT tablename, policyname, cmd
      FROM pg_policies
      WHERE schemaname = 'public'
      AND tablename IN ('medication_logs', 'daily_checkins', 'treatment_plans')
      ORDER BY tablename, policyname;
    `);
    console.log('Policies found:', policies.rows);

    const medicationConstraint = await client.query(`
      SELECT conname
      FROM pg_constraint
      WHERE conrelid = 'public.medication_logs'::regclass
      AND contype = 'u';
    `);
    console.log('Medication unique constraints:', medicationConstraint.rows);

    await client.end();
  } catch (e) {
    console.error('Migration failed:', e.message);
    try { await client.end(); } catch(_){}
    process.exit(1);
  }
}

main();
