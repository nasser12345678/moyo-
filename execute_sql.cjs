const { Client } = require('pg');
const fs = require('fs');

async function main() {
  const sql = fs.readFileSync('supabase_setup.sql', 'utf8');
  
  // Try with direct DB host first
  const connectionStrings = [
    `postgresql://postgres.wqyfxyzqgtndgmyobxfc:7LdAxuUdt%40da%2F%24g@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`
  ];

  for (const uri of connectionStrings) {
    console.log(`Trying connection... host: ${uri.split('@')[1]}`);
    const client = new Client({ connectionString: uri, ssl: { rejectUnauthorized: false } });
    try {
      await client.connect();
      console.log('Connected successfully!');
      await client.query(sql);
      console.log('SQL executed successfully!');
      
      // Verify tables
      const res = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('profiles', 'messages', 'tb_information');
      `);
      console.log('Tables found:', res.rows.map(r => r.table_name));
      await client.end();
      return;
    } catch (e) {
      console.error(`Failed to connect or execute on this host: ${e.message}`);
    }
  }
  console.log('All connection attempts failed.');
}

main();
