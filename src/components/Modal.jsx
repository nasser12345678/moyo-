import React from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, message, icon }) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-[#0b21287a] z-50 flex items-center justify-center p-[20px]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <section 
        className="relative bg-white w-[min(390px,100%)] p-[35px] text-center rounded-[18px] shadow-[0_25px_70px_rgba(0,0,0,0.2)] animate-in fade-in zoom-in duration-200"
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="modal-title"
      >
        <button 
          className="absolute right-[13px] top-[13px] border-0 bg-[#f1f4f2] rounded-[8px] w-[30px] h-[30px] flex items-center justify-center text-[#536970] hover:bg-[#e2e8e5] transition-colors" 
          aria-label="Close"
          onClick={onClose}
        >
          <X size={16} />
        </button>
        <span className="flex items-center justify-center m-auto w-[54px] h-[54px] rounded-full bg-[#dff1e7] text-[var(--color-green)] text-[24px]">
          {icon || '✓'}
        </span>
        <h2 id="modal-title" className="font-[Manrope] font-extrabold text-[21px] my-[16px_7px]">{title}</h2>
        <p className="text-[var(--color-muted)] leading-relaxed">{message}</p>
        <button 
          className="w-full mt-[10px] border-0 rounded-[9px] inline-flex items-center justify-center gap-[8px] font-bold bg-[var(--color-navy)] text-white p-[11px_17px] shadow-[0_5px_14px_rgba(23,55,67,0.14)] hover:bg-[#24515e] transition-colors"
          onClick={onClose}
        >
          Done
        </button>
      </section>
    </div>
  );
}
