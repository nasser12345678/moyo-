import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Trash2, ArrowUp } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Chat({ chat, addMessage, clearChat }) {
  const { t, language } = useLanguage();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (text) => {
    if (!text.trim() || isLoading) return;
    
    // Add user message
    addMessage('user', text.trim());
    setInput('');
    setIsLoading(true);

    const apiMessages = [
      { role: "system", content: "You are Moyo, a friendly and empathetic TB (Tuberculosis) treatment companion. Your goal is to help users stick to their medication routines, offer general TB lifestyle guidance, and provide wellbeing check-ins. Keep answers concise (1-3 sentences) and warm. ALWAYS remind the user to contact their TB clinic or emergency services for specific medical advice or severe symptoms (like coughing up blood, yellow eyes, severe pain)." + (language === 'fr' ? " Please reply in French." : "") },
      ...chat.map(m => ({
        role: m.role === 'bot' ? 'assistant' : 'user',
        content: m.text
      })),
      { role: "user", content: text.trim() }
    ];

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "Moyo TB ChatBOT",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages: apiMessages
        })
      });
      
      const data = await response.json();
      if (data.choices && data.choices[0] && data.choices[0].message) {
        addMessage('bot', data.choices[0].message.content);
      } else {
        addMessage('bot', t('networkError') || "I'm having trouble connecting right now. Please try again later.");
      }
    } catch (error) {
      console.error("API Error:", error);
      addMessage('bot', t('apiError') || "I'm sorry, there was a problem reaching my brain. Please try again in a moment.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSend(input);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  useEffect(() => {
    const handleEvent = (e) => handleSend(e.detail);
    window.addEventListener('sendChatMessage', handleEvent);
    return () => window.removeEventListener('sendChatMessage', handleEvent);
  }, []);

  return (
    <section className="block animate-in fade-in duration-300 max-w-[850px]" aria-labelledby="chat-title">
      <header className="flex items-center justify-between m-[8px_0_26px] bg-white border border-[var(--color-line)] rounded-[14px] p-[15px_18px] mb-[12px]">
        <div className="flex items-center gap-[10px]">
          <span className="w-[39px] h-[39px] rounded-[12px] bg-[var(--color-navy)] text-[#d9eee5] flex items-center justify-center">
            <Sparkles size={18} />
          </span>
          <div>
            <h2 id="chat-title" className="font-[Manrope] font-extrabold text-[14px] m-0">{t('askMoyo')}</h2>
            <p className="text-[9px] text-[#839295] m-[3px_0_0] flex items-center gap-[5px]">
              <span className="w-[7px] h-[7px] rounded-full bg-[#3c9d74]"></span> {t('hereToSupport')}
            </p>
          </div>
        </div>
        <button 
          className="w-[40px] h-[40px] rounded-[11px] border border-[var(--color-line)] bg-white text-[#536970] flex items-center justify-center hover:bg-[#ffece8] hover:text-[#e05d43] hover:border-[#ffdbd3] transition-colors"
          onClick={() => { clearChat(); window.dispatchEvent(new CustomEvent('showToast', { detail: t('clearConversation') })); }}
          aria-label={t('clearConversation')}
        >
          <Trash2 size={18} />
        </button>
      </header>
      <article className="h-[calc(100vh-190px)] min-h-[540px] bg-white border border-[var(--color-line)] rounded-[14px] flex flex-col p-[20px] max-md:h-[calc(100vh-220px)] max-md:min-h-[480px]">
        <div className="flex-1 overflow-auto p-[4px_4px_15px] flex flex-col gap-[12px]" aria-live="polite">
          {chat.map((m, i) => (
            <div key={i} className={`max-w-[72%] p-[11px_13px] rounded-[13px] text-[13px] leading-relaxed max-md:max-w-[88%] animate-in slide-in-from-bottom-2 fade-in duration-300 ${m.role === 'bot' ? 'self-start bg-[#e9f4ef] rounded-bl-[3px]' : 'self-end bg-[var(--color-navy)] text-white rounded-br-[3px]'}`}>
              {m.text}
              <time className="block text-[8px] opacity-60 mt-[5px]">{m.time || t('now')}</time>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="flex gap-[7px] flex-wrap m-[4px_0_10px]">
          {[{q: language === 'fr' ? "Que faire si j'oublie une dose ?" : "What should I do if I miss a dose?", label: language === 'fr' ? "Dose manquée" : "Missed dose"}, {q: language === 'fr' ? "J'ai des nausées après mon médicament" : "I feel nauseous after my medicine", label: language === 'fr' ? "Nausée" : "Nausea"}, {q: language === 'fr' ? "Puis-je faire de l'exercice ?" : "Can I exercise during treatment?", label: language === 'fr' ? "Exercice" : "Exercise"}].map(btn => (
            <button 
              key={btn.label}
              className="bg-white border border-[#e4ebe8] rounded-[15px] p-[6px_10px] text-[#607276] text-[9px] hover:border-[#9fcbb7] hover:text-[#276c52] hover:-translate-y-0.5 transition-all"
              onClick={() => handleSend(btn.q)}
            >
              {btn.label}
            </button>
          ))}
        </div>
        <form className={`flex border border-[#dce7e2] rounded-[12px] p-[5px] bg-[#f9fbfa] transition-shadow ${isLoading ? 'opacity-70' : 'focus-within:border-[#80ae9a] focus-within:shadow-[0_0_0_3px_#e7f2ed]'}`} onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="chat-input-field">Message Moyo</label>
          <input 
            id="chat-input-field" 
            className="flex-1 border-0 outline-none bg-transparent p-[9px]" 
            autoComplete="off" 
            placeholder={isLoading ? t('moyoTyping') : t('askAbout')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="w-[37px] h-[37px] rounded-[9px] bg-[var(--color-navy)] text-white border-0 flex items-center justify-center transition-colors disabled:bg-[#839295] hover:bg-[#24515e]" 
            aria-label="Send message"
            disabled={isLoading}
          >
            <ArrowUp size={18} className={isLoading ? "animate-bounce" : ""} />
          </button>
        </form>
        <p className="text-center text-[#9aa7a9] text-[8px] mt-[8px]">{t('moyoDisclaimer')}</p>
      </article>
    </section>
  );
}
