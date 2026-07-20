import React from 'react';
import { HeartPulse, LayoutGrid, Pill, Activity, MessagesSquare, BookOpen, Users, Headphones, ArrowRight, ChevronsUpDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Sidebar({ activeSection, onNavigate, medBadge, isOpen, setIsOpen }) {
  const { t } = useLanguage();

  const navItems = [
    { id: 'overview', icon: LayoutGrid, label: t('overview') },
    { id: 'medication', icon: Pill, label: t('medication'), badge: medBadge },
    { id: 'health', icon: Activity, label: t('healthCheckIn') },
    { id: 'chat', icon: MessagesSquare, label: t('askMoyo') },
  ];

  const supportItems = [
    { id: 'learn', icon: BookOpen, label: t('learn') },
    { id: 'care-team', icon: Users, label: t('careTeam') },
  ];

  const NavLink = ({ item }) => {
    const isActive = activeSection === item.id;
    const Icon = item.icon;
    return (
      <a
        href={`#${item.id}`}
        onClick={(e) => { e.preventDefault(); onNavigate(item.id); setIsOpen(false); }}
        className={`flex items-center gap-[13px] p-[11px_13px] my-1 rounded-[10px] font-medium transition-all duration-200 hover:bg-[#d5efe41f] hover:text-white hover:scale-[1.02] ${isActive ? 'bg-[#d5efe41f] text-white shadow-[inset_3px_0_#99d2b8]' : 'text-[#afc1c4]'}`}
      >
        <Icon size={18} />
        <span>{item.label}</span>
        {item.badge !== undefined && (
          <span className="ml-auto bg-[#ef987a] text-white rounded-[12px] min-w-[22px] text-center text-[11px] px-[6px] py-[2px]">{item.badge}</span>
        )}
      </a>
    );
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-[#0b21287a] z-20 md:hidden ${isOpen ? 'block' : 'hidden'}`}
        onClick={() => setIsOpen(false)}
      ></div>
      <aside 
        className={`fixed inset-y-0 left-0 w-[246px] max-md:w-[250px] bg-[var(--color-navy)] text-[#eef7f3] p-[30px_18px_18px] flex flex-col z-30 transition-transform duration-250 md:translate-x-0 ${isOpen ? 'translate-x-0 shadow-[20px_0_40px_rgba(0,0,0,0.2)]' : 'max-md:-translate-x-full'}`}
        aria-label="Main navigation"
      >
        <a className="flex items-center gap-[11px] font-[Manrope] font-extrabold text-[22px] px-[13px] hover:opacity-90 transition-opacity" href="#overview" onClick={(e) => { e.preventDefault(); onNavigate('overview'); setIsOpen(false); }}>
          <span className="w-[34px] h-[34px] rounded-[11px] bg-[#d7eee3] text-[var(--color-navy)] flex items-center justify-center">
            <HeartPulse size={21} />
          </span>
          <span>Moyo</span>
        </a>
        
        <nav className="mt-[40px]">
          <p className="text-[10px] tracking-[1.8px] text-[#829ba3] m-[0_13px_12px] font-bold">{t('careSpace')}</p>
          {navItems.map(item => <NavLink key={item.id} item={item} />)}
          
          <p className="text-[10px] tracking-[1.8px] text-[#829ba3] m-[30px_13px_12px] font-bold">{t('support')}</p>
          {supportItems.map(item => <NavLink key={item.id} item={item} />)}
        </nav>

        <article className="mt-auto bg-[#ffffff12] border border-[#ffffff14] p-[15px] rounded-[13px] hover:bg-[#ffffff1a] transition-colors">
          <span className="flex items-center justify-center w-[30px] h-[30px] rounded-[9px] bg-[#e8f5ef] text-[var(--color-navy)] mb-[11px]">
            <Headphones size={18} />
          </span>
          <strong className="text-[13px]">{t('needUrgentHelp')}</strong>
          <p className="text-[11px] text-[#a9bec2] leading-relaxed my-[6px]">{t('contactCareTeam')}</p>
          <button 
            className="border-0 bg-transparent p-0 text-[#d1e8de] font-bold text-[11px] inline-flex items-center gap-[6px] hover:text-white transition-colors"
            onClick={() => { onNavigate('care-team'); setIsOpen(false); }}
          >
            {t('viewCareContacts')} <ArrowRight size={14} />
          </button>
        </article>

        <footer className="border-t border-[#ffffff1a] mt-[16px] pt-[15px]">
          <button className="w-full bg-transparent border-0 text-white flex items-center gap-[10px] text-left p-[4px] hover:bg-[#ffffff12] rounded-[10px] transition-colors" aria-label="Open profile">
            <span className="w-[36px] h-[36px] rounded-full bg-[#e9aa8b] text-[#583b31] flex items-center justify-center font-bold">AK</span>
            <span className="flex flex-col flex-1">
              <strong className="text-[12px]">Amara K.</strong>
              <small className="text-[#8fa9af] text-[9px] mt-[3px]">{t('patientId')} · TB-2048</small>
            </span>
            <ChevronsUpDown size={14} className="text-[#91a8ad]" />
          </button>
        </footer>
      </aside>
    </>
  );
}
