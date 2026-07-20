import React, { useEffect, useState } from 'react';
import { CircleCheck } from 'lucide-react';

export default function Toast({ message, duration = 2400, onClose }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (message) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 250); // wait for transition
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  return (
    <div 
      className={`fixed right-[25px] bottom-[25px] bg-[var(--color-navy)] text-white p-[12px_16px] rounded-[10px] flex items-center gap-[8px] transition-all duration-250 z-50 shadow-[var(--shadow-custom)] ${show ? 'translate-y-0 opacity-100' : 'translate-y-[90px] opacity-0'}`}
      role="status" 
      aria-live="polite"
    >
      <CircleCheck size={18} className="text-[#a9d8c2]" />
      <span>{message}</span>
    </div>
  );
}
