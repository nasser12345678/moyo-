import React from 'react';
import { ArrowRight } from 'lucide-react';
import { articles } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

export default function Learn() {
  const { t } = useLanguage();
  const colors = ['bg-[#a8d4c0]', 'bg-[#edaf92]', 'bg-[#b8acd0]', 'bg-[#e5c07d]'];

  return (
    <section className="block animate-in fade-in duration-300" aria-labelledby="learn-title">
      <header className="flex items-center justify-between m-[8px_0_26px] max-md:items-start">
        <div>
          <p className="text-[#97a5a7] text-[10px] tracking-[1.6px] font-bold m-[0_0_5px]">{t('learn').toUpperCase()}</p>
          <h2 id="learn-title" className="font-[Manrope] font-extrabold text-[27px] m-0 max-[420px]:text-[23px]">{t('understandTreatment')}</h2>
          <p className="text-[var(--color-muted)] m-[6px_0]">{t('clearPracticalInfo')}</p>
        </div>
      </header>
      <div className="grid grid-cols-3 gap-[18px] max-[1050px]:grid-cols-2 max-md:grid-cols-1">
        {articles.map((a, i) => (
          <article key={a[0]} className="bg-white border border-[var(--color-line)] rounded-[14px] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(31,59,57,0.08)] group cursor-pointer">
            <div className={`h-[9px] ${colors[i]}`}></div>
            <div className="p-[20px]">
              <span className="text-[9px] tracking-[1px] text-[var(--color-green)] font-extrabold">{t(a[0])}</span>
              <h3 className="font-[Manrope] font-extrabold text-[16px] m-[8px_0] group-hover:text-[var(--color-green)] transition-colors">{t(a[1])}</h3>
              <p className="text-[12px] text-[var(--color-muted)] leading-relaxed m-0">{t(a[2])}</p>
              <button className="mt-[16px] border-0 bg-transparent p-0 text-[var(--color-green)] font-bold text-[12px] inline-flex items-center gap-[6px] group-hover:text-[#1e5a42] transition-colors">
                {t('readArticle')} <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
