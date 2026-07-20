import React from 'react';
import { Flame, Pill, ArrowRight, Clock3, Check, Sparkles, ArrowUpRight, CalendarDays, Clock, MapPin, ChevronDown, CircleCheck, HeartPulse, TrendingUp } from 'lucide-react';
import { medicines } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

export default function Overview({ state, updateState, toggleDose, onNavigate }) {
  const { t } = useLanguage();
  const dosesTaken = state.doseTaken ? 7 : 6;
  const dosesPercent = state.doseTaken ? '100%' : '85%';
  const checkinTotal = state.checkins;

  return (
    <section className="block animate-in fade-in duration-300" aria-labelledby="overview-title">
      <h2 id="overview-title" className="sr-only">Treatment overview</h2>
      
      <article className="bg-gradient-to-br from-[#d8eee3] via-[#eaf5ef] to-[#f3f7ef] rounded-[17px] p-[25px_31px] flex items-center gap-[40px] shadow-[var(--shadow-custom)] max-md:p-[22px] max-md:items-start max-[420px]:p-[18px]">
        <div className="flex-1">
          <span className="inline-flex items-center gap-[7px] text-[9px] tracking-[1.2px] font-extrabold text-[#276c52] bg-[#ffffffa3] p-[6px_9px] rounded-[20px]">
            <span className="w-[7px] h-[7px] rounded-full bg-[#3c9d74]"></span> {t('treatmentOnTrack')}
          </span>
          <h2 className="font-[Manrope] font-extrabold text-[25px] m-[12px_0_2px]">{t('day')} <span>47</span> {t('of')} 180</h2>
          <p className="m-0 text-[#668179] text-[12px]">{t('intensivePhase')}</p>
          <div className="h-[7px] bg-[#ffffffbf] rounded-[10px] mt-[20px] overflow-hidden" role="progressbar" aria-label="Treatment progress" aria-valuemin="0" aria-valuemax="180" aria-valuenow="47">
            <span className="block w-[26%] h-full rounded-inherit bg-[var(--color-green)] transition-all duration-500 hover:bg-[#1e5a42]"></span>
          </div>
          <div className="flex justify-between mt-[7px] text-[#7c918b] text-[9px] max-[420px]:justify-between">
            <span>{t('started')} 2 Apr</span>
            <strong className="text-[#456d60]">26% {t('complete')}</strong>
            <span className="max-[420px]:hidden">{t('est')} 28 Sep</span>
          </div>
        </div>
        <div className="text-center px-[12px] max-md:hidden group cursor-pointer">
          <div className="w-[112px] h-[112px] rounded-full bg-[#ffffff8f] border-[7px] border-[#ffffff80] shadow-[inset_0_0_0_2px_#acd4c1] flex flex-col items-center justify-center transition-transform group-hover:scale-105">
            <Flame size={17} className="text-[#df865e] fill-[#df865e]" />
            <strong className="font-[Manrope] font-extrabold text-[24px] leading-[1.1]">12</strong>
            <span className="text-[9px] text-[#648077]">{t('dayStreak')}</span>
          </div>
          <p className="text-[9px] mt-[7px]">{t('longestStreak')}: 24 {t('day').toLowerCase()}s</p>
        </div>
      </article>

      <section className="grid grid-cols-[minmax(0,1.8fr)_minmax(285px,0.82fr)] gap-[24px] mt-[30px] max-[1050px]:grid-cols-1 max-md:mt-[24px]">
        <div className="flex flex-col gap-[24px]">
          <div>
            <header className="flex justify-between items-end mb-[13px]">
              <div>
                <p className="text-[#97a5a7] text-[10px] tracking-[1.6px] font-bold m-[0_0_5px]">{t('today')}</p>
                <h2 className="font-[Manrope] font-extrabold text-[17px] m-0">{t('yourMedication')}</h2>
              </div>
              <button 
                className="border-0 bg-transparent p-0 text-[var(--color-green)] font-bold text-[12px] inline-flex items-center gap-[6px] hover:text-[#1e5a42] transition-colors"
                onClick={() => onNavigate('medication')}
              >
                {t('viewSchedule')} <ArrowRight size={14} />
              </button>
            </header>
            <article className="bg-white border border-[#e7eeeb] rounded-[13px] shadow-[0_5px_20px_rgba(33,57,53,0.035)] flex items-center p-[17px_18px] gap-[14px] max-md:items-start max-md:flex-wrap transition-shadow hover:shadow-[0_8px_30px_rgba(33,57,53,0.08)]">
              <div className="w-[44px] h-[44px] rounded-[12px] flex items-center justify-center shrink-0 bg-[#fde9e2] text-[#d66e52]">
                <Pill size={20} />
              </div>
              <div className="flex-1 min-[420px]:min-w-[190px]">
                <h3 className="text-[14px] font-bold m-[0_0_3px]">{t('morningDose')}</h3>
                <p className="text-[10px] text-[var(--color-muted)] m-[0_0_9px]">{t('takeAfterBreakfast')} · 4 {t('medicinesCount')}</p>
                <div className="flex gap-[5px] flex-wrap">
                  <span className="text-[8px] bg-[#f2f5f3] text-[#6d7c7e] p-[4px_7px] rounded-[5px]">Rifampicin 600mg</span>
                  <span className="text-[8px] bg-[#f2f5f3] text-[#6d7c7e] p-[4px_7px] rounded-[5px]">Isoniazid 300mg</span>
                  <span className="text-[8px] bg-[#f2f5f3] text-[#6d7c7e] p-[4px_7px] rounded-[5px]">+2 {t('more')}</span>
                </div>
              </div>
              <div className="text-right max-md:w-full max-md:flex max-md:items-center max-md:justify-between">
                <p className="text-[10px] text-[#708286] flex gap-[4px] items-center justify-end max-md:m-0">
                  <Clock3 size={12} /> 8:00 AM
                </p>
                <button 
                  className={`mt-[4px] max-md:mt-0 border-0 rounded-[9px] inline-flex items-center justify-center gap-[8px] font-bold p-[9px_12px] text-[10px] transition-colors ${state.doseTaken ? 'bg-[#dff1e7] text-[#287255]' : 'bg-[var(--color-navy)] text-white hover:bg-[#24515e]'}`}
                  onClick={() => {
                    toggleDose();
                    window.dispatchEvent(new CustomEvent('showToast', { detail: state.doseTaken ? 'Dose status updated' : 'Morning dose marked as taken' }));
                  }}
                >
                  <Check size={14} />
                  <span>{state.doseTaken ? `${t('takenAt')} 8:06 AM` : t('markAsTaken')}</span>
                </button>
              </div>
            </article>
          </div>

          <div>
            <header className="flex justify-between items-end mb-[13px]">
              <div>
                <p className="text-[#97a5a7] text-[10px] tracking-[1.6px] font-bold m-[0_0_5px]">{t('dailyCheckIn')}</p>
                <h2 className="font-[Manrope] font-extrabold text-[17px] m-0">{t('howFeeling')}</h2>
              </div>
              <span className="text-[10px] text-[#98a5a7]">{t('takes30Seconds')}</span>
            </header>
            <article className="bg-white border border-[#e7eeeb] rounded-[13px] shadow-[0_5px_20px_rgba(33,57,53,0.035)] p-[18px] flex items-center gap-[20px] max-md:flex-col transition-shadow hover:shadow-[0_8px_30px_rgba(33,57,53,0.08)]">
              <div className="flex justify-around flex-1 max-md:w-full" role="radiogroup" aria-label="Choose how you feel">
                {['Struggling', 'Not great', 'Okay', 'Good', 'Great'].map((m, i) => {
                  const emojis = ['😣', '😕', '😐', '🙂', '😊'];
                  const isSelected = state.mood === m;
                  return (
                    <button 
                      key={m}
                      className={`border border-transparent bg-transparent rounded-[11px] p-[6px_9px] max-md:p-[5px] max-[420px]:p-[4px_2px] flex flex-col gap-[4px] items-center transition-colors group ${isSelected ? 'bg-[#f0f7f3] border-[#b6d8c8] text-[var(--color-green)]' : 'text-[#7f8e91] hover:bg-[#f0f7f3] hover:border-[#b6d8c8] hover:text-[var(--color-green)]'}`}
                      onClick={() => updateState({ mood: m })}
                      aria-label={m}
                    >
                      <span className={`text-[25px] max-md:text-[22px] transition-all duration-200 ${isSelected ? 'scale-115 filter-none' : 'grayscale-[0.25] group-hover:scale-115 group-hover:filter-none'}`}>
                        {emojis[i]}
                      </span>
                      <small className="text-[9px] max-[420px]:text-[8px]">{m}</small>
                    </button>
                  );
                })}
              </div>
              <button 
                className="border-0 rounded-[9px] inline-flex items-center justify-center gap-[8px] font-bold bg-[#eef4f1] text-[#315f50] p-[10px_14px] text-[11px] hover:bg-[#e2ebe6] transition-colors disabled:opacity-45 disabled:cursor-not-allowed max-md:w-full"
                disabled={!state.mood}
                onClick={() => {
                  updateState({ checkins: Math.min(7, state.checkins + 1) });
                  window.dispatchEvent(new CustomEvent('showModal', { detail: { title: 'Check-in saved', message: 'Thank you for checking in. Small updates help you see meaningful progress over time.' } }));
                }}
              >
                {t('continueCheckIn')} <ArrowRight size={14} />
              </button>
            </article>
          </div>
        </div>

        <aside className="flex flex-col gap-[18px] max-[1050px]:grid max-[1050px]:grid-cols-2 max-md:grid-cols-1">
          <article className="bg-gradient-to-br from-white to-[#f5f9f7] border border-[#e7eeeb] rounded-[13px] shadow-[0_5px_20px_rgba(33,57,53,0.035)] p-[18px] max-[420px]:p-[15px] hover:-translate-y-1 transition-transform">
            <div className="flex items-center gap-[10px]">
              <span className="w-[39px] h-[39px] rounded-[12px] bg-[var(--color-navy)] text-[#d9eee5] flex items-center justify-center">
                <Sparkles size={18} />
              </span>
              <div>
                <h2 className="font-[Manrope] font-extrabold text-[14px] m-0">Ask Moyo</h2>
                <p className="text-[9px] text-[#839295] m-[3px_0_0]">{t('healthCompanion')}</p>
              </div>
              <span className="ml-auto text-[8px] text-[#3c8d6d] bg-[#e7f4ed] p-[4px_7px] rounded-[9px]">{t('online')}</span>
            </div>
            <div className="bg-[#e5f2ec] rounded-[10px_10px_10px_2px] p-[11px] m-[16px_0_10px] w-[85%]">
              <p className="text-[10px] m-0 leading-relaxed">{t('chatPreview')}</p>
              <span className="text-[7px] text-[#83958f]">10:24 AM</span>
            </div>
            <div className="flex flex-col gap-[6px] items-end">
              {["What if I miss a dose?", "Are orange tears normal?", "Can I exercise?"].map((q) => (
                <button 
                  key={q}
                  className="bg-white border border-[#e4ebe8] rounded-[15px] p-[6px_10px] text-[#607276] text-[9px] hover:border-[#9fcbb7] hover:text-[#276c52] transition-colors"
                  onClick={() => {
                    onNavigate('chat');
                    setTimeout(() => window.dispatchEvent(new CustomEvent('sendChatMessage', { detail: q })), 120);
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
            <button 
              className="w-full border-0 rounded-[9px] inline-flex items-center justify-center gap-[8px] font-bold bg-[var(--color-navy)] text-white p-[10px] mt-[15px] text-[10px] hover:bg-[#24515e] transition-colors"
              onClick={() => onNavigate('chat')}
            >
              {t('startConversation')} <ArrowUpRight size={13} />
            </button>
          </article>

          <article className="bg-white border border-[#e7eeeb] rounded-[13px] shadow-[0_5px_20px_rgba(33,57,53,0.035)] p-[16px_18px] max-[420px]:p-[15px] hover:-translate-y-1 transition-transform">
            <div className="flex gap-[10px] items-center">
              <span className="w-[34px] h-[34px] rounded-[9px] bg-[#fce9e0] text-[#d47355] flex items-center justify-center">
                <CalendarDays size={16} />
              </span>
              <div>
                <p className="text-[8px] tracking-[1px] text-[#96a3a5] m-[0_0_4px]">{t('nextAppointment')}</p>
                <h3 className="text-[12px] font-bold m-0">Tuesday, 26 May</h3>
              </div>
            </div>
            <p className="text-[9px] text-[#718286] flex items-center gap-[6px] m-[10px_0]"><Clock size={12} /> 10:30 AM · TB Clinic</p>
            <p className="text-[9px] text-[#718286] flex items-center gap-[6px] m-[10px_0]"><MapPin size={12} /> Community Health Centre</p>
            <button 
              className="mt-[4px] border-0 bg-transparent p-0 text-[var(--color-green)] font-bold text-[12px] inline-flex items-center gap-[6px] hover:text-[#1e5a42] transition-colors"
              onClick={() => onNavigate('care-team')}
            >
              {t('viewDetails')} <ArrowRight size={14} />
            </button>
          </article>
        </aside>
      </section>

      <section className="mt-[29px]">
        <header className="flex justify-between items-end mb-[13px]">
          <div>
            <p className="text-[#97a5a7] text-[10px] tracking-[1.6px] font-bold m-[0_0_5px]">{t('thisWeek')}</p>
            <h2 className="font-[Manrope] font-extrabold text-[17px] m-0">{t('progressAtGlance')}</h2>
          </div>
          <button className="bg-white border border-[var(--color-line)] rounded-[7px] p-[7px_9px] text-[9px] text-[#64767a] flex items-center gap-[4px] hover:bg-gray-50 transition-colors">
            Last 7 days <ChevronDown size={11} />
          </button>
        </header>
        <div className="grid grid-cols-3 gap-[14px] max-[1050px]:grid-cols-1">
          <article className="bg-white border border-[#e7eeeb] rounded-[13px] shadow-[0_5px_20px_rgba(33,57,53,0.035)] p-[15px] flex items-center gap-[11px] min-w-0 max-[1050px]:min-h-[78px] hover:shadow-[0_8px_30px_rgba(33,57,53,0.08)] transition-shadow">
            <span className="w-[35px] h-[35px] rounded-[10px] flex items-center justify-center shrink-0 bg-[#e2f2ea] text-[#3c8c6b]"><CircleCheck size={16} /></span>
            <div>
              <p className="text-[9px] text-[#7e8f92] m-0">{t('dosesTaken')}</p>
              <strong className="font-[Manrope] font-extrabold text-[16px] block m-[2px_0]">{dosesTaken} of 7</strong>
              <small className="text-[8px] text-[#879598]"><b className="text-[#388266]">↑ 14%</b> {t('fromLastWeek')}</small>
            </div>
            <div className="h-[43px] flex items-end gap-[3px] ml-auto" aria-hidden="true">
              {[60, 75, 62, 85, 90, 78].map((h, i) => <i key={i} className="block w-[4px] bg-[#68a98c] rounded-[3px] transition-all duration-500 hover:h-full cursor-pointer" style={{ height: `${h}%` }}></i>)}
              <i className="block w-[4px] bg-[#dbe5e0] rounded-[3px] transition-all duration-500" style={{ height: '38%' }}></i>
            </div>
          </article>
          <article className="bg-white border border-[#e7eeeb] rounded-[13px] shadow-[0_5px_20px_rgba(33,57,53,0.035)] p-[15px] flex items-center gap-[11px] min-w-0 max-[1050px]:min-h-[78px] hover:shadow-[0_8px_30px_rgba(33,57,53,0.08)] transition-shadow">
            <span className="w-[35px] h-[35px] rounded-[10px] flex items-center justify-center shrink-0 bg-[#eee9f4] text-[#7f65a2]"><HeartPulse size={16} /></span>
            <div>
              <p className="text-[9px] text-[#7e8f92] m-0">{t('healthCheckIn')}s</p>
              <strong className="font-[Manrope] font-extrabold text-[16px] block m-[2px_0]">{checkinTotal} of 7</strong>
              <small className="text-[8px] text-[#879598]">{t('keepCheckingIn')}</small>
            </div>
            <div className="grid grid-cols-[repeat(4,5px)] gap-[4px] ml-auto" aria-label="Five of seven check-ins">
              {[...Array(checkinTotal)].map((_, i) => <i key={i} className="h-[5px] rounded-full bg-[#8a70aa]"></i>)}
              {[...Array(7 - checkinTotal)].map((_, i) => <i key={i} className="h-[5px] rounded-full bg-[#ddd8e4]"></i>)}
            </div>
          </article>
          <article className="bg-white border border-[#e7eeeb] rounded-[13px] shadow-[0_5px_20px_rgba(33,57,53,0.035)] p-[15px] flex items-center gap-[11px] min-w-0 max-[1050px]:min-h-[78px] hover:shadow-[0_8px_30px_rgba(33,57,53,0.08)] transition-shadow">
            <span className="w-[35px] h-[35px] rounded-[10px] flex items-center justify-center shrink-0 bg-[#f9ebde] text-[#cf8243]"><TrendingUp size={16} /></span>
            <div>
              <p className="text-[9px] text-[#7e8f92] m-0">{t('overallWellbeing')}</p>
              <strong className="font-[Manrope] font-extrabold text-[16px] block m-[2px_0]">{state.mood || 'Good'}</strong>
              <small className="text-[8px] text-[#879598]"><b className="text-[#388266]">{t('stable')}</b> this week</small>
            </div>
            <div className="w-[80px] ml-auto" aria-hidden="true">
              <svg viewBox="0 0 120 45" className="w-full h-auto overflow-visible hover:scale-105 transition-transform">
                <path d="M2 37 C17 34,18 19,32 25 S50 37,62 21 S80 13,91 18 S106 5,118 8" fill="none" stroke="#e19554" strokeWidth="2" />
                <path className="fill-[#faeadb] opacity-75" d="M2 37 C17 34,18 19,32 25 S50 37,62 21 S80 13,91 18 S106 5,118 8 L118 45 L2 45Z" />
              </svg>
            </div>
          </article>
        </div>
      </section>
    </section>
  );
}
