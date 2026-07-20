import React from 'react';
import { Pill, Check, Clock3, Info } from 'lucide-react';
import { medicines } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

export default function Medication({ state, toggleMedicine }) {
  const { t } = useLanguage();
  return (
    <section className="block animate-in fade-in duration-300" aria-labelledby="medication-title">
      <header className="flex items-center justify-between m-[8px_0_26px] max-md:items-start">
        <div>
          <p className="text-[#97a5a7] text-[10px] tracking-[1.6px] font-bold m-[0_0_5px]">{t('treatmentPlan')}</p>
          <h2 id="medication-title" className="font-[Manrope] font-extrabold text-[27px] m-0 max-[420px]:text-[23px]">{t('medicationSchedule')}</h2>
          <p className="text-[var(--color-muted)] m-[6px_0]">{t('keepVisible')}</p>
        </div>
        <span className="bg-[#eef4f1] text-[var(--color-green)] p-[7px_12px] rounded-[9px] text-[10px] font-bold tracking-[0.5px] max-md:hidden">{t('activePlan')}</span>
      </header>
      <div className="grid grid-cols-[2.5fr_1fr] gap-[22px] max-[1050px]:grid-cols-1">
        <div>
          <h3 className="font-[Manrope] font-extrabold text-[17px] m-[0_0_15px]">{t('todaysMedicines')}</h3>
          <div className="flex flex-col gap-[12px]">
            {medicines.map(m => {
              const isTaken = state.medicines[m[0]];
              return (
                <article key={m[0]} className={`bg-white border rounded-[13px] shadow-[0_5px_20px_rgba(33,57,53,0.035)] p-[18px_20px] flex items-center justify-between transition-all max-[420px]:p-[15px] hover:shadow-[0_8px_30px_rgba(33,57,53,0.08)] ${isTaken ? 'opacity-70 border-[#e7eeeb]' : 'border-[var(--color-line)]'}`}>
                  <div className="flex items-center gap-[15px]">
                    <div className="w-[46px] h-[46px] rounded-[13px] bg-[#f9fbfa] border border-[#eef3f1] flex items-center justify-center text-[#556c6f]">
                      <Pill size={22} />
                    </div>
                    <div>
                      <h4 className={`text-[15px] font-extrabold m-[0_0_3px] transition-colors ${isTaken ? 'line-through text-[#9ba9ab]' : ''}`}>{m[0]} <span className="text-[12px] font-medium text-[#718286] ml-[4px] no-underline inline-block">{m[2]}</span></h4>
                      <p className="text-[11px] text-[var(--color-muted)] m-0 flex items-center gap-[6px]">
                        <span className="font-semibold text-[#5a6f72]">{m[1]} {t(m[1] === 1 ? 'tablet' : 'tablets')}</span> · {m[3] ? t('takeAfterBreakfast') : 'Mondays & Thursdays'}
                      </p>
                    </div>
                  </div>
                  <button 
                    className={`w-[42px] h-[42px] rounded-full flex items-center justify-center border-2 transition-all cursor-pointer ${isTaken ? 'bg-[#dff1e7] border-[#dff1e7] text-[#287255]' : 'bg-transparent border-[#dfe7e5] text-transparent hover:border-[#b6d8c8] hover:bg-[#f0f7f3]'}`}
                    onClick={() => toggleMedicine(m[0])}
                    aria-label={isTaken ? t('markAsTaken') : 'Mark ' + m[0] + ' as un-taken'}
                  >
                    <Check size={18} className={isTaken ? 'opacity-100' : 'opacity-0'} />
                  </button>
                </article>
              );
            })}
          </div>
        </div>
        <aside>
          <article className="bg-[#1f483c] text-white rounded-[13px] shadow-[0_5px_20px_rgba(23,55,67,0.12)] p-[22px] sticky top-[20px] max-[420px]:p-[15px] hover:-translate-y-1 transition-transform duration-300">
            <p className="text-[10px] tracking-[1.6px] font-bold text-[#8baea0] m-[0_0_5px]">{t('adherence').toUpperCase()}</p>
            <h3 className="font-[Manrope] font-extrabold text-[36px] m-0 leading-none">94<span className="text-[20px] text-[#8baea0]">%</span></h3>
            <p className="text-[11px] text-[#8ea0a3] m-[8px_0_0] leading-relaxed">{t('excellentProgress')}</p>
          </article>
        </aside>
      </div>
    </section>
  );
}
