import { useState, useEffect } from 'react';

const INITIAL_CHAT = [
  { role: 'bot', text: "Hi Amara — I’m Moyo. I can help with general TB treatment questions, medication routines, and wellbeing check-ins. What’s on your mind?" }
];

export function useMoyoState() {
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem('moyoState');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          doseTaken: parsed.doseTaken ?? false,
          medicines: parsed.medicines ?? [false, false, false, false],
          mood: parsed.mood ?? '',
          checkins: parsed.checkins ?? 5,
          chat: parsed.chat?.length ? parsed.chat : INITIAL_CHAT,
          health: parsed.health ?? null
        };
      } catch (e) {
        console.error("Failed to parse state", e);
      }
    }
    return {
      doseTaken: false,
      medicines: [false, false, false, false],
      mood: '',
      checkins: 5,
      chat: INITIAL_CHAT,
      health: null
    };
  });

  useEffect(() => {
    localStorage.setItem('moyoState', JSON.stringify(state));
  }, [state]);

  const updateState = (updates) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const toggleDose = () => {
    setState(prev => {
      const newDoseTaken = !prev.doseTaken;
      return {
        ...prev,
        doseTaken: newDoseTaken,
        medicines: prev.medicines.map(() => newDoseTaken)
      };
    });
  };

  const toggleMedicine = (index) => {
    setState(prev => {
      const newMedicines = [...prev.medicines];
      newMedicines[index] = !newMedicines[index];
      const newDoseTaken = newMedicines.every(Boolean);
      return { ...prev, medicines: newMedicines, doseTaken: newDoseTaken };
    });
  };

  const saveCheckin = (mood, answers, notes) => {
    setState(prev => ({
      ...prev,
      mood,
      checkins: prev.mood ? prev.checkins : Math.min(7, prev.checkins + 1), // Only increment if mood wasn't set previously today
      health: { answers, notes, date: new Date().toISOString() }
    }));
  };

  const addMessage = (role, text) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setState(prev => ({
      ...prev,
      chat: [...prev.chat, { role, text, time }]
    }));
  };

  const clearChat = () => {
    setState(prev => ({ ...prev, chat: [] }));
  };

  return {
    ...state,
    updateState,
    toggleDose,
    toggleMedicine,
    saveCheckin,
    addMessage,
    clearChat
  };
}
