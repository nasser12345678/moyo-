import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MobileHeader from './components/MobileHeader';
import Topbar from './components/Topbar';
import Overview from './components/Overview';
import Medication from './components/Medication';
import Health from './components/Health';
import Chat from './components/Chat';
import Learn from './components/Learn';
import CareTeam from './components/CareTeam';
import Toast from './components/Toast';
import Modal from './components/Modal';
import { useMoyoState } from './hooks/useMoyoState';

export default function App() {
  const moyoState = useMoyoState();
  const [activeSection, setActiveSection] = useState('overview');
  const [toastMsg, setToastMsg] = useState('');
  const [modalData, setModalData] = useState({ isOpen: false });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.slice(1);
      if (hash && ['overview', 'medication', 'health', 'chat', 'learn', 'care-team'].includes(hash)) {
        setActiveSection(hash);
      }
    };
    window.addEventListener('popstate', handleHash);
    handleHash();
    return () => window.removeEventListener('popstate', handleHash);
  }, []);

  useEffect(() => {
    const onShowToast = (e) => {
      setToastMsg('');
      setTimeout(() => setToastMsg(e.detail), 50);
    };
    const onShowModal = (e) => {
      setModalData({ isOpen: true, ...e.detail });
    };
    window.addEventListener('showToast', onShowToast);
    window.addEventListener('showModal', onShowModal);
    return () => {
      window.removeEventListener('showToast', onShowToast);
      window.removeEventListener('showModal', onShowModal);
    };
  }, []);

  const navigate = (section) => {
    setActiveSection(section);
    window.history.pushState(null, '', `#${section}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const medBadge = moyoState.doseTaken ? '✓' : '2';

  return (
    <>
      <Sidebar 
        activeSection={activeSection} 
        onNavigate={navigate} 
        medBadge={medBadge} 
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      <MobileHeader onMenuClick={() => setSidebarOpen(true)} onNavigate={navigate} />

      <main className="ml-[246px] p-[35px_46px_60px] max-w-[1500px] transition-all duration-300 max-[1050px]:p-[30px] max-md:ml-0 max-md:p-[22px_16px_50px] max-[420px]:px-[12px]">
        {activeSection !== 'chat' && <Topbar onNavigate={navigate} />}

        {activeSection === 'overview' && <Overview state={moyoState} updateState={moyoState.updateState} toggleDose={moyoState.toggleDose} onNavigate={navigate} />}
        {activeSection === 'medication' && <Medication state={moyoState} toggleMedicine={moyoState.toggleMedicine} />}
        {activeSection === 'health' && <Health state={moyoState} saveCheckin={moyoState.saveCheckin} />}
        {activeSection === 'chat' && <Chat chat={moyoState.chat} addMessage={moyoState.addMessage} clearChat={moyoState.clearChat} />}
        {activeSection === 'learn' && <Learn />}
        {activeSection === 'care-team' && <CareTeam />}
      </main>

      <Toast message={toastMsg} onClose={() => setToastMsg('')} />
      <Modal 
        isOpen={modalData.isOpen} 
        onClose={() => setModalData({ isOpen: false })} 
        title={modalData.title} 
        message={modalData.message} 
      />
    </>
  );
}
