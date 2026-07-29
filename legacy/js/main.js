/* ==============================================
   MOYO – main.js  (Auth-first, per-user state)
   ============================================== */

/* ── Supabase ── */
const SUPABASE_URL     = 'https://wqyfxyzqgtndgmyobxfc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_dAeQs8XgnG8BBHAaVfzoxA_pwJyQk-f';
const supabase = window.supabase
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

let currentUser        = null;
let currentSessionToken = null;

/* ── Per-user state helpers ── */
function stateKey()   { return currentUser ? `moyoState_${currentUser.id}` : 'moyoState_guest'; }
function loadState()  {
  const raw = localStorage.getItem(stateKey());
  const s   = raw ? JSON.parse(raw) : {};
  s.doseTaken  ??= false;
  s.medicines  ??= [false, false, false, false];
  s.mood       ??= '';
  s.checkins   ??= 5;
  s.chat       ??= [];
  return s;
}
function saveState()  { localStorage.setItem(stateKey(), JSON.stringify(state)); }

let state = loadState();   // will be reloaded after login

/* ── Static data ── */
const medicines = [
  ['Rifampicin',    '600 mg · 2 capsules',   '08:00 AM'],
  ['Isoniazid',     '300 mg · 1 tablet',     '08:00 AM'],
  ['Pyrazinamide',  '1,500 mg · 3 tablets',  '08:00 AM'],
  ['Ethambutol',    '1,200 mg · 3 tablets',  '08:00 AM']
];
const symptoms = ['Cough', 'Nausea', 'Tiredness', 'Appetite'];
const articles = [
  ['MEDICATION',        'Why finishing treatment matters',    'Learn how every dose protects your recovery and prevents drug resistance.'],
  ['SIDE EFFECTS',      'What changes are expected?',         'A practical guide to common effects and signs that need prompt medical attention.'],
  ['DAILY LIFE',        'Food, rest, and movement',           'Simple ways to support your body while you complete treatment.'],
  ['PROTECTING OTHERS', 'Reducing TB transmission',           'Understand ventilation, masks, testing, and when you are less likely to be infectious.']
];

/* ── Utilities ── */
function iconRefresh() { if (window.lucide) lucide.createIcons(); }
function showToast(text) {
  const t = document.querySelector('#toast');
  t.querySelector('span').textContent = text;
  t.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => t.classList.remove('show'), 2400);
}
function updateDate() {
  document.querySelector('#today-label').textContent =
    new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
}

/* ── Auth UI ── */
window.authMode = 'login';
window.switchAuthTab = function (mode) {
  window.authMode = mode;
  const isLogin = mode === 'login';
  document.getElementById('tab-login').style.borderColor  = isLogin ? 'var(--green)' : 'transparent';
  document.getElementById('tab-login').style.color        = isLogin ? 'var(--green)' : 'var(--muted)';
  document.getElementById('tab-signup').style.borderColor = isLogin ? 'transparent' : 'var(--green)';
  document.getElementById('tab-signup').style.color       = isLogin ? 'var(--muted)' : 'var(--green)';
  document.getElementById('auth-submit-btn').textContent  = isLogin ? 'Log In' : 'Create Account';
  document.getElementById('auth-error').style.display   = 'none';
  document.getElementById('auth-success').style.display = 'none';
};

function showAuthOverlay() {
  document.getElementById('loading-screen')?.style && (document.getElementById('loading-screen').style.display = 'none');
  const overlay = document.getElementById('auth-overlay');
  if (overlay) { overlay.style.display = 'grid'; }
  const shell = document.getElementById('app-shell');
  if (shell) { shell.classList.remove('ready'); }
}

function hideAuthOverlay() {
  document.getElementById('loading-screen')?.style && (document.getElementById('loading-screen').style.display = 'none');
  const overlay = document.getElementById('auth-overlay');
  if (overlay) { overlay.style.display = 'none'; }
  const shell = document.getElementById('app-shell');
  if (shell) { shell.classList.add('ready'); }
}

/* ── Navigation ── */
function navigate(section) {
  const target = document.getElementById(section) || document.getElementById('overview');
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v === target));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.section === target.id));
  document.querySelector('#sidebar').classList.remove('open');
  document.querySelector('#menu-button')?.setAttribute('aria-expanded', 'false');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (location.hash !== `#${target.id}`) history.pushState(null, '', `#${target.id}`);
  if (target.id === 'chat') setTimeout(() => document.querySelector('#chat-input-field').focus(), 100);
}

/* ── Medicine list ── */
function renderMedicineList() {
  document.querySelector('#medicine-list').innerHTML = medicines.map((m, i) => `
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

function syncDose() {
  const btn = document.querySelector('#take-dose-button');
  btn.classList.toggle('taken', state.doseTaken);
  btn.querySelector('span').textContent = state.doseTaken ? 'Taken at 8:06 AM' : 'Mark as taken';
  state.medicines = state.medicines.map(() => state.doseTaken);
  document.querySelector('#med-nav-badge').textContent   = state.doseTaken ? '✓' : '2';
  document.querySelector('#weekly-doses').textContent    = state.doseTaken ? '7 of 7' : '6 of 7';
  renderMedicineList();
  saveState();
}

/* ── Symptoms ── */
function renderSymptoms() {
  document.querySelector('#symptom-list').innerHTML = symptoms.map(s => `
    <div class="symptom-row" data-symptom="${s}">
      <p>${s}</p>
      ${['None', 'Mild', 'Moderate', 'Severe'].map(l =>
        `<button class="severity" data-level="${l}">${l}</button>`).join('')}
    </div>`).join('');
}

/* ── Chat ── */
function initialChatMessage() {
  return [{ role: 'bot', text: "Hi — I'm Moyo. I can help with general TB treatment questions, medication routines, and wellbeing check-ins. What's on your mind?" }];
}

function renderChat() {
  const container = document.querySelector('#chat-messages');
  const items     = state.chat.length ? state.chat : initialChatMessage();
  container.innerHTML = items.map(m =>
    `<div class="message ${m.role}">${m.text}<time>${m.time || 'Now'}</time></div>`
  ).join('');
  container.scrollTop = container.scrollHeight;
}

async function sendMessage(text) {
  if (!text.trim()) return;

  if (!currentSessionToken) {
    showToast('Please log in to use the chat.');
    return;
  }

  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  state.chat.push({ role: 'user', text: text.trim(), time });
  saveState();
  renderChat();

  const tempId = Date.now();
  state.chat.push({ id: tempId, role: 'bot', text: '🔍 Consulting verified TB records...', time });
  renderChat();

  try {
    const res = await fetch('/.netlify/functions/ask-tb-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentSessionToken}` },
      body: JSON.stringify({ question: text.trim() })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to get response');

    let answerHtml = result.answer;
    if (result.sources?.length) {
      answerHtml += `<br><br><small style="color:var(--green)">📚 Verified Sources: ${
        result.sources.map(s => `<strong>${s.title}</strong>`).join(', ')
      }</small>`;
    }

    const idx = state.chat.findIndex(m => m.id === tempId);
    if (idx !== -1) {
      state.chat[idx].text = answerHtml;
      state.chat[idx].time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  } catch (err) {
    const idx = state.chat.findIndex(m => m.id === tempId);
    if (idx !== -1) state.chat[idx].text = `⚠️ Error: ${err.message}. Please try again.`;
  }

  saveState();
  renderChat();
}

/* ── Load user profile & chat history from Supabase ── */
async function loadUserData() {
  /* Re-load state from per-user localStorage key */
  Object.assign(state, loadState());

  /* Update profile UI */
  const emailSpan  = document.getElementById('profile-email');
  const avatarSpan = document.getElementById('profile-avatar');
  if (emailSpan)  emailSpan.textContent  = currentUser.email;
  if (avatarSpan) avatarSpan.textContent = currentUser.email.substring(0, 2).toUpperCase();

  /* Restore chat history from Supabase */
  try {
    const res = await fetch('/.netlify/functions/get-chat-history', {
      headers: { Authorization: `Bearer ${currentSessionToken}` }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.messages?.length) {
        state.chat = data.messages.map(m => ({
          id:   m.id,
          role: m.role,
          text: m.content + (m.sources?.length
            ? `<br><br><small style="color:var(--green)">📚 Verified Sources: ${
                m.sources.map(s => s.title).join(', ')}</small>`
            : ''),
          time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        saveState();
      }
    }
  } catch (e) { console.warn('Could not load chat history:', e); }
}

/* ── Render the whole dashboard ── */
function renderDashboard() {
  updateDate();
  renderMedicineList();
  renderSymptoms();
  renderChat();

  document.querySelector('#learning-grid').innerHTML = articles.map(a => `
    <article class="learning-card">
      <div class="learning-color"></div>
      <div class="learning-copy">
        <span>${a[0]}</span><h3>${a[1]}</h3><p>${a[2]}</p>
        <button class="text-button">Read article <i data-lucide="arrow-right"></i></button>
      </div>
    </article>`).join('');

  if (state.doseTaken) syncDose();
  if (state.mood) {
    document.querySelector(`[data-mood="${state.mood}"]`)?.classList.add('selected');
    document.querySelector('#continue-checkin').disabled = false;
    document.querySelector('#wellbeing-label').textContent = state.mood;
  }
  iconRefresh();
}

/* ── Wire up all event listeners (called once on DOMContentLoaded) ── */
function attachListeners() {
  /* Navigation */
  document.querySelectorAll('.nav-item').forEach(l =>
    l.addEventListener('click', e => { e.preventDefault(); navigate(l.dataset.section); }));
  document.querySelectorAll('[data-action]').forEach(b =>
    b.addEventListener('click', () => navigate(b.dataset.action === 'open-chat' ? 'chat' : b.dataset.action)));
  document.querySelector('#menu-button').addEventListener('click', e => {
    const s = document.querySelector('#sidebar');
    s.classList.toggle('open');
    e.currentTarget.setAttribute('aria-expanded', s.classList.contains('open'));
  });
  document.addEventListener('click', e => {
    if (innerWidth <= 760 && !e.target.closest('#sidebar') && !e.target.closest('#menu-button'))
      document.querySelector('#sidebar').classList.remove('open');
  });
  window.addEventListener('popstate', () => navigate(location.hash.slice(1) || 'overview'));

  /* Medication */
  document.querySelector('#take-dose-button').addEventListener('click', () => {
    state.doseTaken = !state.doseTaken;
    syncDose();
    showToast(state.doseTaken ? 'Morning dose marked as taken' : 'Dose status updated');
  });
  document.querySelector('#medicine-list').addEventListener('click', e => {
    const b = e.target.closest('[data-med-index]');
    if (!b) return;
    const i = +b.dataset.medIndex;
    state.medicines[i] = !state.medicines[i];
    state.doseTaken = state.medicines.every(Boolean);
    saveState(); renderMedicineList();
    showToast(`${medicines[i][0]} updated`);
  });

  /* Mood / checkin */
  document.querySelectorAll('.mood').forEach(btn =>
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mood').forEach(x => x.classList.remove('selected'));
      btn.classList.add('selected');
      state.mood = btn.dataset.mood;
      document.querySelector('#continue-checkin').disabled = false;
    }));
  document.querySelector('#continue-checkin').addEventListener('click', () => {
    state.checkins = Math.min(7, state.checkins + 1);
    document.querySelector('#checkin-total').textContent = `${state.checkins} of 7`;
    document.querySelector('#wellbeing-label').textContent = state.mood;
    saveState();
    document.querySelector('#checkin-modal').hidden = false;
  });
  document.querySelectorAll('.modal-close,.modal-done').forEach(b =>
    b.addEventListener('click', () => document.querySelector('#checkin-modal').hidden = true));
  document.querySelector('#checkin-modal').addEventListener('click', e => {
    if (e.target.id === 'checkin-modal') e.currentTarget.hidden = true;
  });

  /* Health */
  document.querySelector('#symptom-list').addEventListener('click', e => {
    if (!e.target.classList.contains('severity')) return;
    e.target.parentElement.querySelectorAll('.severity').forEach(b => b.classList.remove('selected'));
    e.target.classList.add('selected');
  });
  document.querySelector('#save-health').addEventListener('click', () => {
    const answers = [...document.querySelectorAll('.symptom-row')].map(r => ({
      symptom: r.dataset.symptom,
      level:   r.querySelector('.selected')?.dataset.level || 'Not answered'
    }));
    state.health = { answers, notes: document.querySelector('#health-notes').value, date: new Date().toISOString() };
    saveState();
    showToast('Health check-in saved');
  });

  /* Chat */
  document.querySelector('#chat-form').addEventListener('submit', e => {
    e.preventDefault();
    const input = document.querySelector('#chat-input-field');
    sendMessage(input.value);
    input.value = '';
  });
  document.querySelectorAll('[data-question]').forEach(btn =>
    btn.addEventListener('click', () => {
      navigate('chat');
      setTimeout(() => sendMessage(btn.dataset.question), 120);
    }));
  document.querySelector('#clear-chat').addEventListener('click', () => {
    state.chat = [];
    saveState();
    renderChat();
    showToast('Conversation cleared');
  });

  /* Auth form */
  document.getElementById('auth-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    if (!supabase) return alert('Supabase not initialized');
    const email    = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    const btn      = document.getElementById('auth-submit-btn');
    const errEl    = document.getElementById('auth-error');
    const succEl   = document.getElementById('auth-success');

    errEl.style.display = 'none';
    succEl.style.display = 'none';
    btn.disabled = true;
    btn.textContent = 'Processing…';

    try {
      if (window.authMode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        succEl.textContent = 'Account created! Check your email to confirm, then log in.';
        succEl.style.display = 'block';
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        /* onAuthStateChange will fire and handle the rest */
      }
    } catch (err) {
      errEl.textContent = err.message;
      errEl.style.display = 'block';
    } finally {
      btn.disabled = false;
      btn.textContent = window.authMode === 'login' ? 'Log In' : 'Create Account';
    }
  });

  /* Logout */
  document.getElementById('logout-btn')?.addEventListener('click', async () => {
    if (supabase) {
      await supabase.auth.signOut();
      /* onAuthStateChange fires → showAuthOverlay() */
    }
  });
}

/* ── Boot ── */
async function init() {
  /* Hide the dashboard immediately — show only after auth confirmed */
  showAuthOverlay();

  attachListeners();
  renderSymptoms();   /* render static lists even before login */

  if (!supabase) {
    console.error('Supabase client could not be initialised.');
    return;
  }

  /* Listen for auth state changes (fires immediately with current session) */
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      currentUser         = session.user;
      currentSessionToken = session.access_token;

      /* Reload per-user state from localStorage */
      const freshState = loadState();
      Object.assign(state, freshState);

      /* Render the dashboard then load remote history */
      renderDashboard();
      hideAuthOverlay();
      navigate(location.hash.slice(1) || 'overview');

      /* Fetch cloud chat history (may override local) */
      await loadUserData();
      renderChat();

    } else {
      /* Logged out or no session */
      currentUser         = null;
      currentSessionToken = null;

      /* Wipe any cached state from memory (don't clear localStorage — other users may share device) */
      Object.assign(state, {
        doseTaken: false, medicines: [false, false, false, false],
        mood: '', checkins: 5, chat: []
      });

      showAuthOverlay();
    }
  });
}

document.addEventListener('DOMContentLoaded', init);