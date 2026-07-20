import React from 'react';
import { Bell, Sparkles, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Topbar({ onNavigate }) {
  const { t, language, toggleLanguage } = useLanguage();
  const dateOptions = { weekday: 'long', day: 'numeric', month: 'long' };
  const today = new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : 'en-GB', dateOptions).format(new Date());

  return (
    <header className="flex justify-between items-center mb-[27px] max-md:items-start">
      <div>
        <p className="text-[10px] tracking-[1.6px] font-bold text-[#8a9b9f] m-[0_0_8px] uppercase" id="today-label">{today}</p>
        <h1 className="font-[Manrope] font-extrabold text-[25px] m-0 max-md:text-[21px]">{t('goodMorning')}, Amara <span aria-hidden="true">👋🏾</span></h1>
        <p className="text-[var(--color-muted)] mt-[5px] mb-0 max-md:text-[12px]">{t('subtitle')}</p>
      </div>
      <div className="flex items-center gap-[12px]">
        <button 
          className="w-[40px] h-[40px] rounded-[11px] border border-[var(--color-line)] bg-white text-[#536970] flex flex-col items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer group"
          onClick={toggleLanguage}
          aria-label="Toggle Language"
        >
          <Globe size={16} className="group-hover:text-[var(--color-green)] transition-colors" />
          <span className="text-[9px] font-bold leading-none mt-[2px]">{language === 'en' ? 'FR' : 'EN'}</span>
        </button>
        <button className="relative w-[40px] h-[40px] rounded-[11px] border border-[var(--color-line)] bg-white text-[#536970] flex items-center justify-center hover:bg-gray-50 transition-colors max-md:hidden" aria-label="Notifications">
          <Bell size={18} />
          <span className="absolute w-[7px] h-[7px] border-2 border-white bg-[#f17c5d] rounded-full right-[8px] top-[7px]"></span>
        </button>
        <button 
          className="border-0 rounded-[9px] inline-flex items-center justify-center gap-[8px] font-bold bg-[var(--color-navy)] text-white p-[11px_17px] shadow-[0_5px_14px_rgba(23,55,67,0.14)] hover:bg-[#24515e] hover:-translate-y-0.5 transition-all max-md:text-[0px] max-md:p-[11px]"
          onClick={() => onNavigate('chat')}
        >
          <Sparkles size={18} className="max-md:m-0" />
          <span className="max-md:hidden">{t('askMoyo')}</span>
        </button>
      </div>
    </header>
  );
}
