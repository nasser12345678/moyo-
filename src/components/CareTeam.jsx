import React from 'react';
import { Phone } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function CareTeam() {
  const { t } = useLanguage();
  return (
    <section className="block animate-in fade-in duration-300" aria-labelledby="care-title">
      <header className="flex items-center justify-between m-[8px_0_26px] max-md:items-start">
        <div>
          <p className="text-[#97a5a7] text-[10px] tracking-[1.6px] font-bold m-[0_0_5px]">{t('support').toUpperCase()}</p>
          <h2 id="care-title" className="font-[Manrope] font-extrabold text-[27px] m-0 max-[420px]:text-[23px]">{t('careTeam')}</h2>
          <p className="text-[var(--color-muted)] m-[6px_0]">{t('keepPeopleClose')}</p>
        </div>
      </header>
      <div className="grid grid-cols-[2fr_1fr] gap-[20px] max-md:grid-cols-1">
        <article className="bg-white border border-[#e7eeeb] rounded-[13px] shadow-[0_5px_20px_rgba(33,57,53,0.035)] p-[22px] flex items-center gap-[13px] max-[420px]:p-[15px] max-md:flex-wrap transition-shadow hover:shadow-[0_8px_30px_rgba(33,57,53,0.08)]">
          <span className="w-[52px] h-[52px] rounded-full bg-[#dceee5] flex items-center justify-center text-[var(--color-green)] font-extrabold shrink-0">DN</span>
          <div className="min-w-[150px]">
            <h3 className="font-[Manrope] font-extrabold text-[17px] m-0 leading-tight">Dr. Naomi Bello</h3>
            <p className="text-[var(--color-muted)] text-[12px] m-0">{t('tbCareCoordinator')}</p>
          </div>
          <button className="ml-auto max-md:ml-0 max-md:w-full border-0 rounded-[9px] inline-flex items-center justify-center gap-[8px] font-bold bg-[#eef4f1] text-[#315f50] p-[10px_14px] text-[11px] hover:bg-[#e2ebe6] hover:-translate-y-0.5 transition-all">
            <Phone size={14} /> {t('callClinic')}
          </button>
        </article>
        <article className="bg-white border border-[#e7eeeb] rounded-[13px] shadow-[0_5px_20px_rgba(33,57,53,0.035)] p-[22px] max-[420px]:p-[15px] transition-shadow hover:shadow-[0_8px_30px_rgba(33,57,53,0.08)]">
          <h3 className="font-[Manrope] font-extrabold text-[17px] m-[0_0_18px]">{t('clinicHours')}</h3>
          <p className="text-[var(--color-muted)] text-[12px] m-0">Monday–Friday · 8:00 AM–5:00 PM</p>
          <p className="text-[var(--color-muted)] text-[12px] m-[10px_0_0] opacity-80">Community Health Centre<br/>12 Hope Street</p>
        </article>
      </div>
    </section>
  );
}
