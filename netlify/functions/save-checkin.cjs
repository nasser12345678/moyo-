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

    const { mood, symptoms, notes } = JSON.parse(event.body || '{}');
    if (!mood) return { statusCode: 400, headers, body: JSON.stringify({ error: 'mood is required' }) };

    const today = new Date().toISOString().split('T')[0];

    // Upsert — INSERT if new, UPDATE if already checked in today
    const { data, error } = await userSb.from('daily_checkins').upsert({
      user_id:      user.id,
      checkin_date: today,
      mood,
      symptoms:     symptoms || [],
      notes:        notes || '',
      updated_at:   new Date().toISOString()
    }, {
      onConflict: 'user_id,checkin_date'
    }).select().single();

    if (error) throw error;

    // Check if this was an update (already existed)
    const wasUpdate = data.created_at !== data.updated_at;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        checkin_date: today,
        was_update: wasUpdate,
        message: wasUpdate
          ? "Your check-in for today has been updated."
          : "Check-in saved! Come back tomorrow for your next one."
      })
    };
  } catch (err) {
    console.error('Save checkin error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
};
