const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };

  try {
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader?.startsWith('Bearer ')) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
    const token = authHeader.split(' ')[1];

    const userSb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });

    const { data: { user }, error: authErr } = await userSb.auth.getUser();
    if (authErr || !user) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Invalid session' }) };

    const { medicines, med_date } = JSON.parse(event.body || '{}');
    // medicines: [{name: 'Rifampicin', taken: true}, ...] OR single {med_name, taken}
    const targetDate = med_date || new Date().toISOString().split('T')[0];

    let toUpsert = [];
    if (Array.isArray(medicines)) {
      // Bulk — all 4 medicines at once
      toUpsert = medicines.map(m => ({
        user_id:  user.id,
        med_date: targetDate,
        med_name: m.name,
        taken:    m.taken,
        taken_at: m.taken ? new Date().toISOString() : null
      }));
    } else {
      // Single medicine
      const { med_name, taken } = JSON.parse(event.body || '{}');
      if (!med_name) return { statusCode: 400, headers, body: JSON.stringify({ error: 'med_name required' }) };
      toUpsert = [{
        user_id:  user.id,
        med_date: targetDate,
        med_name,
        taken:    !!taken,
        taken_at: taken ? new Date().toISOString() : null
      }];
    }

    // Upsert each entry
    for (const entry of toUpsert) {
      const { error } = await userSb.from('medication_logs').upsert(entry, {
        onConflict: 'user_id,med_date,med_name'
      });
      if (error) throw error;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, date: targetDate, count: toUpsert.length })
    };
  } catch (err) {
    console.error('Save medication error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
};
