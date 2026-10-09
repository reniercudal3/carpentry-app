import { useState, useEffect } from 'react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Already installed as standalone
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    // User already dismissed
    if (localStorage.getItem('compassInstallDismissed') === 'true') return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!visible || !deferredPrompt) return null;

  const handleInstall = async () => {
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setVisible(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem('compassInstallDismissed', 'true');
    setVisible(false);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: '#2c1810',
      color: '#f5f0eb',
      padding: '20px 24px',
      zIndex: 9999,
      boxShadow: '0 -4px 20px rgba(0,0,0,0.4)',
      borderTop: '2px solid #8B4513',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px',
    }}>
      <div style={{ fontSize: '28px' }}>🪚</div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 700, fontSize: '18px', marginBottom: '4px' }}>Install Compass</div>
        <div style={{ fontSize: '14px', opacity: 0.85, maxWidth: '340px' }}>
          Install Compass on your home screen for quick, offline access to your carpentry lessons.
        </div>
      </div>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={handleInstall}
          style={{
            background: '#8B4513',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 28px',
            fontWeight: 700,
            fontSize: '15px',
            cursor: 'pointer',
          }}
        >
          Install App
        </button>
        <button
          onClick={handleDismiss}
          style={{
            background: 'transparent',
            color: '#f5f0eb',
            border: 'none',
            opacity: 0.7,
            fontSize: '14px',
            cursor: 'pointer',
            padding: '4px 8px',
          }}
        >
          Maybe Later
        </button>
      </div>
    </div>
  );
}
