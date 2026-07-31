const { createClient } = require('@supabase/supabase-js');
const { getSupabaseConfig } = require('./supabase-config.cjs');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'GET') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };

  try {
    const { supabaseUrl, supabaseAnonKey: supabaseAnon } = getSupabaseConfig();

    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader?.startsWith('Bearer ')) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
    const token = authHeader.split(' ')[1];

    const userSb = createClient(supabaseUrl, supabaseAnon, { global: { headers: { Authorization: `Bearer ${token}` } } });

    const { data: { user }, error: authErr } = await userSb.auth.getUser();
    if (authErr || !user) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Invalid session' }) };

    const today = new Date().toISOString().split('T')[0];

    // 1. Treatment plan
    const { data: plan } = await userSb.from('treatment_plans').select('*').eq('user_id', user.id).single();
    const startDate    = plan?.start_date || today;
    const durationDays = plan?.duration_days || 180;
    const displayName  = plan?.display_name || user.email.split('@')[0];
    const phase        = plan?.phase || 'intensive';
    const startMs      = new Date(startDate).getTime();
    const todayMs      = new Date(today).getTime();
    const treatmentDay = Math.max(1, Math.floor((todayMs - startMs) / 86400000) + 1);
    const progressPct  = Math.min(100, Math.round((treatmentDay / durationDays) * 100));

    // 2. Today's medication status
    const { data: todayMeds } = await userSb.from('medication_logs')
      .select('med_name, taken, taken_at')
      .eq('user_id', user.id).eq('med_date', today);

    const medicines = ['Rifampicin', 'Isoniazid', 'Pyrazinamide', 'Ethambutol'];
    const medicationStatus = medicines.map(name => {
      const log = (todayMeds || []).find(m => m.med_name === name);
      return { name, taken: log?.taken || false, taken_at: log?.taken_at || null };
    });
    const allTakenToday = medicationStatus.every(m => m.taken);

    // 3. Today's check-in status
    const { data: todayCheckin } = await userSb.from('daily_checkins')
      .select('*').eq('user_id', user.id).eq('checkin_date', today).maybeSingle();

    // 4. Streak calculation — consecutive days (backwards from yesterday) with all 4 meds taken
    const { data: recentMeds } = await userSb.from('medication_logs')
      .select('med_date, taken')
      .eq('user_id', user.id).eq('taken', true)
      .gte('med_date', new Date(todayMs - 30 * 86400000).toISOString().split('T')[0])
      .order('med_date', { ascending: false });

    // Count meds per day
    const dayMedCounts = {};
    (recentMeds || []).forEach(m => {
      dayMedCounts[m.med_date] = (dayMedCounts[m.med_date] || 0) + 1;
    });

    let currentStreak = 0;
    // Start from today if all taken, otherwise from yesterday
    let checkDate = new Date(today);
    if (allTakenToday) {
      // include today in streak
    } else {
      checkDate.setDate(checkDate.getDate() - 1);
    }
    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (allTakenToday && i === 0) {
        currentStreak++;
      } else if ((dayMedCounts[dateStr] || 0) >= 4) {
        currentStreak++;
      } else {
        break;
      }
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // 5. Weekly dose stats (last 7 days including today)
    const weekAgo = new Date(todayMs - 6 * 86400000).toISOString().split('T')[0];
    const { data: weekMeds } = await userSb.from('medication_logs')
      .select('med_date, taken')
      .eq('user_id', user.id).eq('taken', true)
      .gte('med_date', weekAgo).lte('med_date', today);

    // Count unique days with all 4 taken
    const weekDayCounts = {};
    (weekMeds || []).forEach(m => { weekDayCounts[m.med_date] = (weekDayCounts[m.med_date] || 0) + 1; });
    const weeklyDosesTaken = Object.values(weekDayCounts).filter(c => c >= 4).length;

    // 6. Check-in count this week
    const { data: weekCheckins } = await userSb.from('daily_checkins')
      .select('id')
      .eq('user_id', user.id)
      .gte('checkin_date', weekAgo).lte('checkin_date', today);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        display_name:          displayName,
        treatment_day:         treatmentDay,
        treatment_duration:    durationDays,
        treatment_phase:       phase,
        progress_pct:          progressPct,
        start_date:            startDate,
        medication_status:     medicationStatus,
        all_taken_today:       allTakenToday,
        checkin_done_today:    !!todayCheckin,
        today_mood:            todayCheckin?.mood || null,
        today_symptoms:        todayCheckin?.symptoms || [],
        current_streak:        currentStreak,
        weekly_doses_taken:    weeklyDosesTaken,
        weekly_doses_possible: 7,
        weekly_checkins:       (weekCheckins || []).length,
        weekly_checkins_possible: 7
      })
    };
  } catch (err) {
    console.error('Dashboard error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
};
