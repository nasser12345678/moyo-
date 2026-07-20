import React, { useState } from 'react';
import { symptoms } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

export default function Health({ state, saveCheckin }) {
  const { t } = useLanguage();
  const [answers, setAnswers] = useState({});
  const [notes, setNotes] = useState('');

  const handleLevel = (symptom, level) => {
    setAnswers(prev => ({ ...prev, [symptom]: level }));
  };

  const handleSave = () => {
    const formattedAnswers = symptoms.map(s => ({
      symptom: s,
      level: answers[s] || 'Not answered'
    }));
    saveCheckin(state.mood, formattedAnswers, notes);
    window.dispatchEvent(new CustomEvent('showModal', { detail: { title: t('checkInSavedTitle'), message: t('checkInSavedMsg') } }));
  };

  return (
    <section className="block animate-in fade-in duration-300" aria-labelledby="health-title">
      <header className="flex items-center justify-between m-[8px_0_26px] max-md:items-start">
        <div>
          <p className="text-[#97a5a7] text-[10px] tracking-[1.6px] font-bold m-[0_0_5px]">{t('health')}</p>
          <h2 id="health-title" className="font-[Manrope] font-extrabold text-[27px] m-0 max-[420px]:text-[23px]">{t('healthCheckIn')}</h2>
          <p className="text-[var(--color-muted)] m-[6px_0]">{t('trackSymptoms')}</p>
        </div>
      </header>
      <article className="bg-white border border-[#e7eeeb] rounded-[13px] shadow-[0_5px_20px_rgba(33,57,53,0.035)] p-[22px] max-w-[780px] transition-shadow hover:shadow-[0_8px_30px_rgba(33,57,53,0.08)]">
        <h3 className="font-[Manrope] font-extrabold text-[17px] m-[0_0_18px]">{t('howSymptoms')}</h3>
        <div>
          {symptoms.map(s => (
            <div key={s} className="grid grid-cols-[1fr_repeat(4,80px)] gap-[10px] items-center p-[13px_0] border-b border-[var(--color-line)] max-md:grid-cols-[1fr_repeat(4,1fr)] max-md:gap-[5px]">
              <p className="m-0 font-semibold max-md:col-span-full">{t(`symptom${s}`)}</p>
              {['None', 'Mild', 'Moderate', 'Severe'].map(level => {
                const isSelected = answers[s] === level;
                return (
                  <button 
                    key={level}
                    className={`border rounded-[8px] p-[8px_5px] text-[10px] transition-all hover:-translate-y-0.5 max-md:text-[9px] ${isSelected ? 'bg-[#e5f2ec] border-[#9fc8b5] text-[var(--color-green)] font-bold' : 'bg-white border-[var(--color-line)] text-[#718286] hover:border-[#9fc8b5] hover:text-[var(--color-green)]'}`}
                    onClick={() => handleLevel(s, level)}
                  >
                    {t(`level${level}`)}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <label className="flex flex-col gap-[9px] mt-[20px] font-bold">
          {t('anythingElse')}
          <textarea 
            className="min-h-[110px] resize-y border border-[var(--color-line)] rounded-[10px] p-[12px] outline-none font-normal focus:border-[#8db9a5] focus:shadow-[0_0_0_3px_#e7f2ed] transition-shadow"
            placeholder={t('notesPlaceholder')}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>
        </label>
        <button 
          className="mt-[15px] border-0 rounded-[9px] inline-flex items-center justify-center gap-[8px] font-bold bg-[var(--color-navy)] text-white p-[11px_17px] shadow-[0_5px_14px_rgba(23,55,67,0.14)] hover:bg-[#24515e] hover:-translate-y-0.5 transition-all w-full md:w-auto"
          onClick={handleSave}
        >
          {t('saveCheckIn')}
        </button>
      </article>
    </section>
  );
}
