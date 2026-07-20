const state = JSON.parse(localStorage.getItem('moyoState') || '{}');
state.doseTaken ??= false;
state.medicines ??= [false, false, false, false];
state.mood ??= '';
state.checkins ??= 5;
state.chat ??= [];

const medicines = [
  ['Rifampicin', '600 mg · 2 capsules', '08:00 AM'],
  ['Isoniazid', '300 mg · 1 tablet', '08:00 AM'],
  ['Pyrazinamide', '1,500 mg · 3 tablets', '08:00 AM'],
  ['Ethambutol', '1,200 mg · 3 tablets', '08:00 AM']
];
const symptoms = ['Cough', 'Nausea', 'Tiredness', 'Appetite'];
const articles = [
  ['MEDICATION', 'Why finishing treatment matters', 'Learn how every dose protects your recovery and prevents drug resistance.'],
  ['SIDE EFFECTS', 'What changes are expected?', 'A practical guide to common effects and signs that need prompt medical attention.'],
  ['DAILY LIFE', 'Food, rest, and movement', 'Simple ways to support your body while you complete treatment.'],
  ['PROTECTING OTHERS', 'Reducing TB transmission', 'Understand ventilation, masks, testing, and when you are less likely to be infectious.']
];

function saveState(){ localStorage.setItem('moyoState', JSON.stringify(state)); }
function iconRefresh(){ if(window.lucide) lucide.createIcons(); }
function showToast(text){ const toast=document.querySelector('#toast'); toast.querySelector('span').textContent=text; toast.classList.add('show'); clearTimeout(showToast.timer); showToast.timer=setTimeout(()=>toast.classList.remove('show'),2400); }

function updateDate(){ document.querySelector('#today-label').textContent=new Intl.DateTimeFormat('en-GB',{weekday:'long',day:'numeric',month:'long'}).format(new Date()); }

function navigate(section){
  const target=document.getElementById(section) || document.getElementById('overview');
  document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v===target));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.section===target.id));
  document.querySelector('#sidebar').classList.remove('open');
  document.querySelector('#menu-button')?.setAttribute('aria-expanded','false');
  window.scrollTo({top:0,behavior:'smooth'});
  if(location.hash!==`#${target.id}`) history.pushState(null,'',`#${target.id}`);
  if(target.id==='chat') setTimeout(()=>document.querySelector('#chat-input-field').focus(),100);
}

function renderMedicineList(){
  const list=document.querySelector('#medicine-list');
  list.innerHTML=medicines.map((m,i)=>`<article class="medicine-row"><span class="medicine-icon ${i===0?'coral':''}"><i data-lucide="${i%2?'circle-dot':'pill'}"></i></span><div><h4>${m[0]}</h4><p>${m[1]} · ${m[2]}</p></div><button class="medicine-check ${state.medicines[i]?'done':''}" data-med-index="${i}" aria-label="${state.medicines[i]?'Mark '+m[0]+' not taken':'Mark '+m[0]+' as taken'}"><i data-lucide="check"></i></button></article>`).join('');
  iconRefresh();
}

function syncDose(){
  const btn=document.querySelector('#take-dose-button');
  btn.classList.toggle('taken',state.doseTaken);
  btn.querySelector('span').textContent=state.doseTaken?'Taken at 8:06 AM':'Mark as taken';
  state.medicines=state.medicines.map(()=>state.doseTaken);
  document.querySelector('#med-nav-badge').textContent=state.doseTaken?'✓':'2';
  document.querySelector('#weekly-doses').textContent=state.doseTaken?'7 of 7':'6 of 7';
  renderMedicineList(); saveState();
}

function renderSymptoms(){
  document.querySelector('#symptom-list').innerHTML=symptoms.map(s=>`<div class="symptom-row" data-symptom="${s}"><p>${s}</p>${['None','Mild','Moderate','Severe'].map(level=>`<button class="severity" data-level="${level}">${level}</button>`).join('')}</div>`).join('');
}

function initialChat(){ return [{role:'bot',text:"Hi Amara — I’m Moyo. I can help with general TB treatment questions, medication routines, and wellbeing check-ins. What’s on your mind?"}]; }
function renderChat(){
  const messages=document.querySelector('#chat-messages');
  const items=state.chat.length?state.chat:initialChat();
  messages.innerHTML=items.map(m=>`<div class="message ${m.role}">${m.text}<time>${m.time||'Now'}</time></div>`).join('');
  messages.scrollTop=messages.scrollHeight;
}
function botReply(input){
  const q=input.toLowerCase();
  if(q.includes('miss')&&q.includes('dose')) return "If you miss a dose, don’t double the next one. Take it when you remember unless it’s almost time for the next dose, and contact your TB clinic for advice specific to your plan.";
  if(q.includes('orange')||q.includes('tear')||q.includes('urine')) return "Rifampicin can turn urine, sweat, saliva, and tears orange-red. This is usually expected, but it can stain soft contact lenses. Contact your care team if you also feel very unwell or notice other worrying symptoms.";
  if(q.includes('exercise')||q.includes('workout')) return "Gentle activity can be helpful if you feel well enough. Start slowly, rest when tired, and ask your clinician before intense exercise—especially if you have shortness of breath, chest pain, fever, or dizziness.";
  if(q.includes('nause')||q.includes('sick')||q.includes('vomit')) return "Nausea can happen with TB medicines. Follow your clinic’s instructions about taking them with food, sip fluids, and contact your care team if vomiting continues or you can’t keep medicine down. Yellow eyes, severe abdominal pain, or dark urine need urgent medical advice.";
  if(q.includes('cough')||q.includes('blood')) return "A cough may take time to improve. Coughing up blood, sudden breathing difficulty, or chest pain needs urgent medical assessment. Please contact emergency services or your clinic now if that is happening.";
  if(q.includes('stop')||q.includes('better')) return "Even if you feel better, keep taking every medicine until your clinician confirms treatment is complete. Stopping early can allow TB to return and become harder to treat.";
  return "Thanks for sharing that. I can offer general treatment guidance, but your TB care team knows your medical history. If this is a new, severe, or worsening symptom, please contact them. Would you like help preparing what to tell the clinic?";
}
function sendMessage(text){
  if(!text.trim()) return;
  const time=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
  state.chat.push({role:'user',text:text.trim(),time}); saveState(); renderChat();
  setTimeout(()=>{state.chat.push({role:'bot',text:botReply(text),time:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})});saveState();renderChat();},450);
}

function init(){
  updateDate(); renderMedicineList(); renderSymptoms(); renderChat();
  document.querySelector('#learning-grid').innerHTML=articles.map(a=>`<article class="learning-card"><div class="learning-color"></div><div class="learning-copy"><span>${a[0]}</span><h3>${a[1]}</h3><p>${a[2]}</p><button class="text-button">Read article <i data-lucide="arrow-right"></i></button></div></article>`).join('');
  if(state.doseTaken) syncDose();
  if(state.mood){ const mood=document.querySelector(`[data-mood="${state.mood}"]`); mood?.classList.add('selected'); document.querySelector('#continue-checkin').disabled=false; document.querySelector('#wellbeing-label').textContent=state.mood; }
  iconRefresh();

  document.querySelectorAll('.nav-item').forEach(link=>link.addEventListener('click',e=>{e.preventDefault();navigate(link.dataset.section);}));
  document.querySelectorAll('[data-action]').forEach(btn=>btn.addEventListener('click',()=>navigate(btn.dataset.action==='open-chat'?'chat':btn.dataset.action)));
  document.querySelector('#menu-button').addEventListener('click',e=>{const side=document.querySelector('#sidebar');side.classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',side.classList.contains('open'));});
  document.addEventListener('click',e=>{if(innerWidth<=760&&!e.target.closest('#sidebar')&&!e.target.closest('#menu-button'))document.querySelector('#sidebar').classList.remove('open');});
  window.addEventListener('popstate',()=>navigate(location.hash.slice(1)||'overview'));

  document.querySelector('#take-dose-button').addEventListener('click',()=>{state.doseTaken=!state.doseTaken;syncDose();showToast(state.doseTaken?'Morning dose marked as taken':'Dose status updated');});
  document.querySelector('#medicine-list').addEventListener('click',e=>{const b=e.target.closest('[data-med-index]');if(!b)return;const i=+b.dataset.medIndex;state.medicines[i]=!state.medicines[i];state.doseTaken=state.medicines.every(Boolean);saveState();renderMedicineList();showToast(`${medicines[i][0]} updated`);});
  document.querySelectorAll('.mood').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.mood').forEach(x=>x.classList.remove('selected'));btn.classList.add('selected');state.mood=btn.dataset.mood;document.querySelector('#continue-checkin').disabled=false;}));
  document.querySelector('#continue-checkin').addEventListener('click',()=>{state.checkins=Math.min(7,state.checkins+1);document.querySelector('#checkin-total').textContent=`${state.checkins} of 7`;document.querySelector('#wellbeing-label').textContent=state.mood;saveState();document.querySelector('#checkin-modal').hidden=false;});
  document.querySelectorAll('.modal-close,.modal-done').forEach(btn=>btn.addEventListener('click',()=>document.querySelector('#checkin-modal').hidden=true));
  document.querySelector('#checkin-modal').addEventListener('click',e=>{if(e.target.id==='checkin-modal')e.currentTarget.hidden=true;});
  document.querySelector('#symptom-list').addEventListener('click',e=>{if(!e.target.classList.contains('severity'))return;e.target.parentElement.querySelectorAll('.severity').forEach(b=>b.classList.remove('selected'));e.target.classList.add('selected');});
  document.querySelector('#save-health').addEventListener('click',()=>{const answers=[...document.querySelectorAll('.symptom-row')].map(r=>({symptom:r.dataset.symptom,level:r.querySelector('.selected')?.dataset.level||'Not answered'}));state.health={answers,notes:document.querySelector('#health-notes').value,date:new Date().toISOString()};saveState();showToast('Health check-in saved');});
  document.querySelector('#chat-form').addEventListener('submit',e=>{e.preventDefault();const input=document.querySelector('#chat-input-field');sendMessage(input.value);input.value='';});
  document.querySelectorAll('[data-question]').forEach(btn=>btn.addEventListener('click',()=>{navigate('chat');setTimeout(()=>sendMessage(btn.dataset.question),120);}));
  document.querySelector('#clear-chat').addEventListener('click',()=>{state.chat=[];saveState();renderChat();showToast('Conversation cleared');});
  navigate(location.hash.slice(1)||'overview');
}

document.addEventListener('DOMContentLoaded',init);