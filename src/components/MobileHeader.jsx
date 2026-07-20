import React from 'react';
import { Menu, HeartPulse, Bell } from 'lucide-react';

export default function MobileHeader({ onMenuClick, onNavigate }) {
  return (
    <header className="md:hidden h-[66px] flex items-center justify-between bg-white border-b border-[var(--color-line)] px-[16px] sticky top-0 z-20">
      <button 
        className="w-[40px] h-[40px] rounded-[11px] border border-[var(--color-line)] bg-white text-[#536970] flex items-center justify-center hover:bg-gray-50 transition-colors" 
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>
      <a 
        className="flex items-center gap-[11px] font-[Manrope] font-extrabold text-[18px] hover:opacity-80 transition-opacity" 
        href="#overview"
        onClick={(e) => { e.preventDefault(); onNavigate('overview'); }}
      >
        <span className="w-[34px] h-[34px] rounded-[11px] bg-[#d7eee3] text-[var(--color-navy)] flex items-center justify-center">
          <HeartPulse size={21} />
        </span>
        <span>Moyo</span>
      </a>
      <button className="w-[40px] h-[40px] rounded-[11px] border border-[var(--color-line)] bg-white text-[#536970] flex items-center justify-center hover:bg-gray-50 transition-colors">
        <Bell size={18} />
      </button>
    </header>
  );
}
