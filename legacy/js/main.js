/* ==============================================
   MOYO – main.js  (Auth-first, DB-backed state)
   ============================================== */

/* ── Supabase client ── */
const SUPABASE_URL      = 'https://wqyfxyzqgtndgmyobxfc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_dAeQs8XgnG8BBHAaVfzoxA_pwJyQk-f';
const sbClient = (window.supabase && window.supabase.createClient)
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

let currentUser         = null;
let currentSessionToken = null;

/* ── Dashboard data from API ── */
let dashboard = null;   // populated from get-user-dashboard

/* ── Local ephemeral state (session only, backed by DB) ── */
let state = {
  doseTaken: false,
  medicines: [false, false, false, false],
  mood: '',
  chat: [],
  checkinDoneToday: false
};

/* ── Static data ── */
const MEDICINE_NAMES = ['Rifampicin', 'Isoniazid', 'Pyrazinamide', 'Ethambutol'];
const MEDICINE_INFO  = [
  ['Rifampicin',   '600 mg · 2 capsules', '08:00 AM'],
  ['Isoniazid',    '300 mg · 1 tablet',   '08:00 AM'],
  ['Pyrazinamide', '1,500 mg · 3 tablets','08:00 AM'],
  ['Ethambutol',   '1,200 mg · 3 tablets','08:00 AM']
];
const SYMPTOMS = ['Cough', 'Nausea', 'Tiredness', 'Appetite'];
const ARTICLES = [
  ['MEDICATION',        'Why finishing treatment matters',  'Learn how every dose protects your recovery and prevents drug resistance.'],
  ['SIDE EFFECTS',      'What changes are expected?',       'A practical guide to common effects and signs that need prompt medical attention.'],
  ['DAILY LIFE',        'Food, rest, and movement',         'Simple ways to support your body while you complete treatment.'],
  ['PROTECTING OTHERS', 'Reducing TB transmission',         'Understand ventilation, masks, testing, and when you are less likely to be infectious.']
];

/* ── Utilities ── */
function iconRefresh() { if (window.lucide) lucide.createIcons(); }
function $(sel)        { return document.querySelector(sel); }
function $$(sel)       { return document.querySelectorAll(sel); }
function showToast(text) {
  const t = $('#toast');
  t.querySelector('span').textContent = text;
  t.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => t.classList.remove('show'), 2400);
}

async function api(path, opts = {}) {
  const res = await fetch(`/.netlify/functions/${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${currentSessionToken}`,
      ...(opts.headers || {})
    }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'API error');
  return data;
}

/* ── Auth UI ── */
window.authMode = 'login';
window.switchAuthTab = function(mode) {
  window.authMode = mode;
  const isLogin = mode === 'login';
  $('#tab-login').style.borderColor  = isLogin ? 'var(--green)' : 'transparent';
  $('#tab-login').style.color        = isLogin ? 'var(--green)' : 'var(--muted)';
  $('#tab-signup').style.borderColor = isLogin ? 'transparent' : 'var(--green)';
  $('#tab-signup').style.color       = isLogin ? 'var(--muted)' : 'var(--green)';
  $('#auth-submit-btn').textContent  = isLogin ? 'Log In' : 'Create Account';
  $('#auth-error').style.display     = 'none';
  $('#auth-success').style.display   = 'none';
};

function showAuthOverlay() {
  const ls = $('#loading-screen');
  if (ls) ls.style.display = 'none';
  const ov = $('#auth-overlay');
  if (ov) ov.style.display = 'grid';
  const sh = $('#app-shell');
  if (sh) sh.classList.remove('ready');
}

function hideAuthOverlay() {
  const ls = $('#loading-screen');
  if (ls) ls.style.display = 'none';
  const ov = $('#auth-overlay');
  if (ov) ov.style.display = 'none';
  const sh = $('#app-shell');
  if (sh) sh.classList.add('ready');
}

/* ── Navigation ── */
function navigate(section) {
  const target = document.getElementById(section) || document.getElementById('overview');
  $$('.view').forEach(v => v.classList.toggle('active', v === target));
  $$('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.section === target.id));
  $('#sidebar').classList.remove('open');
  $('#menu-button')?.setAttribute('aria-expanded', 'false');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (location.hash !== `#${target.id}`) history.pushState(null, '', `#${target.id}`);
  if (target.id === 'chat') setTimeout(() => $('#chat-input-field').focus(), 100);
}

/* ── Render: Medicine list ── */
function renderMedicineList() {
  $('#medicine-list').innerHTML = MEDICINE_INFO.map((m, i) => `
    <article class="medicine-row">
      <span class="medicine-icon ${i === 0 ? 'coral' : ''}"><i data-lucide="${i % 2 ? 'circle-dot' : 'pill'}"></i></span>
      <div><h4>${m[0]}</h4><p>${m[1]} · ${m[2]}</p></div>
      <button class="medicine-check ${state.medicines[i] ? 'done' : ''}" data-med-index="${i}"
        aria-label="${state.medicines[i] ? 'Mark ' + m[0] + ' not taken' : 'Mark ' + m[0] + ' as taken'}">
        <i data-lucide="check"></i>
      </button>
    </article>`).join('');
  iconRefresh();
}

function syncDoseUI() {
  const btn = $('#take-dose-button');
  state.doseTaken = state.medicines.every(Boolean);
  btn.classList.toggle('taken', state.doseTaken);
  btn.querySelector('span').textContent = state.doseTaken
    ? `Taken at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : 'Mark as taken';
  $('#med-nav-badge').textContent = state.doseTaken ? '✓' : String(state.medicines.filter(m => !m).length);
  renderMedicineList();
}

/* ── Render: Symptoms ── */
function renderSymptoms() {
  $('#symptom-list').innerHTML = SYMPTOMS.map(s => `
    <div class="symptom-row" data-symptom="${s}">
      <p>${s}</p>
      ${['None', 'Mild', 'Moderate', 'Severe'].map(l =>
        `<button class="severity" data-level="${l}">${l}</button>`).join('')}
    </div>`).join('');
}

/* ── Render: Chat ── */
function renderChat() {
  const container = $('#chat-messages');
  const name = dashboard?.display_name || 'there';
  const items = state.chat.length ? state.chat : [
    { role: 'bot', text: `Hi ${name} — I'm Moyo. I can help with general TB treatment questions, medication routines, and wellbeing check-ins. What's on your mind?` }
  ];
  container.innerHTML = items.map(m =>
    `<div class="message ${m.role}">${m.text}<time>${m.time || 'Now'}</time></div>`
  ).join('');
  container.scrollTop = container.scrollHeight;
}

async function sendMessage(text) {
  if (!text.trim() || !currentSessionToken) return;
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  state.chat.push({ role: 'user', text: text.trim(), time });
  renderChat();

  const tempId = Date.now();
  state.chat.push({ id: tempId, role: 'bot', text: '🔍 Consulting verified TB records...', time });
  renderChat();

  try {
    const result = await api('ask-tb-assistant', {
      method: 'POST',
      body: JSON.stringify({ question: text.trim() })
    });
    let answerHtml = result.answer;
    if (result.sources?.length) {
      answerHtml += `<br><br><small style="color:var(--green)">📚 Sources: ${
        result.sources.map(s => `<strong>${s.title}</strong>`).join(', ')}</small>`;
    }
    const idx = state.chat.findIndex(m => m.id === tempId);
    if (idx !== -1) {
      state.chat[idx].text = answerHtml;
      state.chat[idx].time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  } catch (err) {
    const idx = state.chat.findIndex(m => m.id === tempId);
    if (idx !== -1) state.chat[idx].text = `⚠️ ${err.message}`;
  }
  renderChat();
}

/* ── Render: Dashboard from API data ── */
function applyDashboard(d) {
  dashboard = d;

  /* Greeting & profile */
  const name = d.display_name || 'Patient';
  const initials = name.substring(0, 2).toUpperCase();
  $('#greeting-name').textContent   = name;
  $('#profile-email').textContent   = name;
  $('#profile-avatar').textContent  = initials;
  $$('.chat-user-name').forEach(el => el.textContent = name);

  /* Treatment progress */
  $('#treatment-day').textContent      = d.treatment_day;
  $('#treatment-duration').textContent = d.treatment_duration;
  $('#treatment-week').textContent     = Math.ceil(d.treatment_day / 7);
  $('#treatment-phase').textContent    = d.treatment_phase === 'intensive' ? 'Intensive' : 'Continuation';
  const progress = $('#treatment-progress');
  progress.style.width = d.progress_pct + '%';
  $('#progress-percent').textContent = d.progress_pct + '% complete';

  /* Dates */
  const startD = new Date(d.start_date);
  const endD   = new Date(startD.getTime() + d.treatment_duration * 86400000);
  const fmt    = { day: 'numeric', month: 'short' };
  $('#start-date-label').textContent = `Started ${startD.toLocaleDateString('en-GB', fmt)}`;
  $('#end-date-label').textContent   = `Est. ${endD.toLocaleDateString('en-GB', fmt)}`;

  /* Streak */
  $('#streak-count').textContent = d.current_streak;

  /* Medication status from DB */
  state.medicines = d.medication_status.map(m => m.taken);
  state.doseTaken = d.all_taken_today;
  syncDoseUI();

  /* Check-in status */
  state.checkinDoneToday = d.checkin_done_today;
  const checkinBtn    = $('#continue-checkin');
  const checkinStatus = $('#checkin-status');
  if (d.checkin_done_today) {
    checkinBtn.disabled = true;
    checkinBtn.style.display = 'none';
    checkinStatus.style.display = 'block';
    /* Pre-select today's mood */
    if (d.today_mood) {
      const moodBtn = document.querySelector(`[data-mood="${d.today_mood}"]`);
      if (moodBtn) moodBtn.classList.add('selected');
    }
  } else {
    checkinBtn.style.display = '';
    checkinStatus.style.display = 'none';
  }

  /* Wellbeing label */
  if (d.today_mood) {
    $('#wellbeing-label').textContent = d.today_mood;
  }

  /* Weekly stats */
  $('#weekly-doses').textContent  = `${d.weekly_doses_taken} of ${d.weekly_doses_possible}`;
  $('#checkin-total').textContent = `${d.weekly_checkins} of ${d.weekly_checkins_possible}`;

  /* Check-in dots */
  const dotsEl = $('#checkin-dots');
  if (dotsEl) {
    dotsEl.innerHTML = Array.from({ length: 7 }, (_, i) =>
      `<i${i < d.weekly_checkins ? '' : ' class="empty"'}></i>`
    ).join('');
  }

  iconRefresh();
}

/* ── Load everything on login ── */
async function loadAllUserData() {
  try {
    /* Dashboard data (treatment, meds, checkins, streaks) */
    const d = await api('get-user-dashboard');
    applyDashboard(d);

    /* Chat history */
    const h = await api('get-chat-history');
    if (h.messages?.length) {
      state.chat = h.messages.map(m => ({
        id:   m.id,
        role: m.role,
        text: m.content + (m.sources?.length
          ? `<br><br><small style="color:var(--green)">📚 Sources: ${m.sources.map(s => s.title).join(', ')}</small>` : ''),
        time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));
    }
    renderChat();
  } catch (e) {
    console.error('Failed to load user data:', e);
  }
}

/* ── Medication: save to DB ── */
async function saveMedicationToDB(singleIndex) {
  try {
    if (singleIndex !== undefined) {
      // Single medicine toggle
      await api('save-medication-log', {
        method: 'POST',
        body: JSON.stringify({
          med_name: MEDICINE_NAMES[singleIndex],
          taken: state.medicines[singleIndex]
        })
      });
    } else {
      // Bulk — all medicines
      await api('save-medication-log', {
        method: 'POST',
        body: JSON.stringify({
          medicines: MEDICINE_NAMES.map((name, i) => ({ name, taken: state.medicines[i] }))
        })
      });
    }
  } catch (e) {
    console.error('Failed to save medication:', e);
    showToast('Could not save — please try again');
  }
}

/* ── Check-in: save to DB ── */
async function saveCheckinToDB(mood, symptoms, notes) {
  try {
    const result = await api('save-checkin', {
      method: 'POST',
      body: JSON.stringify({ mood, symptoms, notes })
    });
    state.checkinDoneToday = true;
    $('#continue-checkin').disabled = true;
    $('#continue-checkin').style.display = 'none';
    $('#checkin-status').style.display = 'block';
    showToast(result.message || 'Check-in saved!');
    return result;
  } catch (e) {
    console.error('Failed to save check-in:', e);
    showToast('Could not save check-in');
  }
}

/* ── Render dashboard static elements ── */
function renderDashboard() {
  $('#today-label').textContent = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long'
  }).format(new Date());

  renderMedicineList();
  renderSymptoms();
  renderChat();

  $('#learning-grid').innerHTML = ARTICLES.map(a => `
    <article class="learning-card">
      <div class="learning-color"></div>
      <div class="learning-copy">
        <span>${a[0]}</span><h3>${a[1]}</h3><p>${a[2]}</p>
        <button class="text-button">Read article <i data-lucide="arrow-right"></i></button>
      </div>
    </article>`).join('');
  iconRefresh();
}

/* ── Attach all event listeners ── */
function attachListeners() {
  /* Navigation */
  $$('.nav-item').forEach(l => l.addEventListener('click', e => { e.preventDefault(); navigate(l.dataset.section); }));
  $$('[data-action]').forEach(b => b.addEventListener('click', () => navigate(b.dataset.action === 'open-chat' ? 'chat' : b.dataset.action)));
  $('#menu-button').addEventListener('click', e => {
    const s = $('#sidebar'); s.classList.toggle('open');
    e.currentTarget.setAttribute('aria-expanded', s.classList.contains('open'));
  });
  document.addEventListener('click', e => {
    if (innerWidth <= 760 && !e.target.closest('#sidebar') && !e.target.closest('#menu-button'))
      $('#sidebar').classList.remove('open');
  });
  window.addEventListener('popstate', () => navigate(location.hash.slice(1) || 'overview'));

  /* Medication — "Mark all as taken" */
  $('#take-dose-button').addEventListener('click', async () => {
    const newState = !state.doseTaken;
    state.medicines = state.medicines.map(() => newState);
    state.doseTaken = newState;
    syncDoseUI();
    showToast(newState ? 'Morning dose marked as taken' : 'Dose status updated');
    await saveMedicationToDB();
  });

  /* Medication — individual toggle */
  $('#medicine-list').addEventListener('click', async (e) => {
    const b = e.target.closest('[data-med-index]');
    if (!b) return;
    const i = +b.dataset.medIndex;
    state.medicines[i] = !state.medicines[i];
    syncDoseUI();
    showToast(`${MEDICINE_NAMES[i]} updated`);
    await saveMedicationToDB(i);
  });

  /* Mood selection */
  $$('.mood').forEach(btn => btn.addEventListener('click', () => {
    if (state.checkinDoneToday) return; // Already checked in today
    $$('.mood').forEach(x => x.classList.remove('selected'));
    btn.classList.add('selected');
    state.mood = btn.dataset.mood;
    $('#continue-checkin').disabled = false;
  }));

  /* Continue check-in → save mood + symptoms to DB */
  $('#continue-checkin').addEventListener('click', async () => {
    if (state.checkinDoneToday) return;
    if (!state.mood) return;

    // Collect symptom answers
    const symptoms = [...$$('.symptom-row')].map(r => ({
      symptom: r.dataset.symptom,
      level:   r.querySelector('.selected')?.dataset.level || 'Not answered'
    }));
    const notes = $('#health-notes')?.value || '';

    await saveCheckinToDB(state.mood, symptoms, notes);

    // Update wellbeing label
    $('#wellbeing-label').textContent = state.mood;

    // Show confirmation modal
    $('#checkin-modal').hidden = false;
  });

  /* Modal close */
  $$('.modal-close,.modal-done').forEach(b => b.addEventListener('click', () => $('#checkin-modal').hidden = true));
  $('#checkin-modal').addEventListener('click', e => { if (e.target.id === 'checkin-modal') e.currentTarget.hidden = true; });

  /* Health symptom severity */
  $('#symptom-list').addEventListener('click', e => {
    if (!e.target.classList.contains('severity')) return;
    e.target.parentElement.querySelectorAll('.severity').forEach(b => b.classList.remove('selected'));
    e.target.classList.add('selected');
  });

  /* Save health — now also saves to DB as a check-in update */
  $('#save-health').addEventListener('click', async () => {
    const symptoms = [...$$('.symptom-row')].map(r => ({
      symptom: r.dataset.symptom,
      level:   r.querySelector('.selected')?.dataset.level || 'Not answered'
    }));
    const notes = $('#health-notes').value;

    // If mood not set, use last known
    const mood = state.mood || dashboard?.today_mood || 'Okay';
    await saveCheckinToDB(mood, symptoms, notes);
    showToast('Health check-in saved');
  });

  /* Chat */
  $('#chat-form').addEventListener('submit', e => {
    e.preventDefault();
    const input = $('#chat-input-field');
    sendMessage(input.value);
    input.value = '';
  });
  $$('[data-question]').forEach(btn => btn.addEventListener('click', () => {
    navigate('chat');
    setTimeout(() => sendMessage(btn.dataset.question), 120);
  }));
  $('#clear-chat').addEventListener('click', () => {
    state.chat = [];
    renderChat();
    showToast('Conversation cleared');
  });

  /* Auth form */
  $('#auth-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    if (!sbClient) return alert('Supabase not initialized');
    const email = $('#auth-email').value.trim();
    const pw    = $('#auth-password').value;
    const btn   = $('#auth-submit-btn');
    const errEl = $('#auth-error');
    const sucEl = $('#auth-success');
    errEl.style.display = 'none'; sucEl.style.display = 'none';
    btn.disabled = true; btn.textContent = 'Processing…';
    try {
      if (window.authMode === 'signup') {
        const { error } = await sbClient.auth.signUp({ email, password: pw });
        if (error) throw error;
        sucEl.textContent = 'Account created! Check your email to confirm, then log in.';
        sucEl.style.display = 'block';
      } else {
        const { error } = await sbClient.auth.signInWithPassword({ email, password: pw });
        if (error) throw error;
      }
    } catch (err) {
      errEl.textContent = err.message; errEl.style.display = 'block';
    } finally {
      btn.disabled = false;
      btn.textContent = window.authMode === 'login' ? 'Log In' : 'Create Account';
    }
  });

  /* Logout */
  $('#logout-btn')?.addEventListener('click', async () => {
    if (sbClient) await sbClient.auth.signOut();
  });
}

/* ── Boot ── */
async function init() {
  showAuthOverlay();
  attachListeners();
  renderSymptoms();

  if (!sbClient) {
    console.error('Supabase client could not be initialised.');
    return;
  }

  sbClient.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      currentUser         = session.user;
      currentSessionToken = session.access_token;

      renderDashboard();
      hideAuthOverlay();
      navigate(location.hash.slice(1) || 'overview');

      /* Load all data from Supabase */
      await loadAllUserData();
    } else {
      currentUser         = null;
      currentSessionToken = null;
      dashboard           = null;
      state = { doseTaken: false, medicines: [false, false, false, false], mood: '', chat: [], checkinDoneToday: false };
      showAuthOverlay();
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
