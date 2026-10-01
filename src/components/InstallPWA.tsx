import { useState, useEffect } from 'react';
import './InstallPWA.css';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Verificar si ya está instalada la PWA
    const standaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    if (standaloneMode) {
      setIsInstalled(true);
      return;
    }

    // 2. Verificar si el usuario ya descartó el aviso en los últimos 5 días
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const days = (Date.now() - parseInt(dismissed)) / (1000 * 60 * 60 * 24);
      if (days < 5) {
        return;
      }
    }

    // 3. Detectar si es iOS (iPhone/iPad)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    if (isIOSDevice) {
      // En iOS Safari no existe beforeinstallprompt, mostramos el banner tras unos segundos
      const timer = setTimeout(() => {
        setShowInstallBanner(true);
      }, 1500);
      return () => clearTimeout(timer);
    }

    // 4. En Android / Chrome / Desktop escuchar evento beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setShowInstallBanner(false);
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallBanner(false);
      }
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error al instalar la PWA:', error);
    }
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    setShowIOSModal(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (isInstalled || !showInstallBanner) return null;

  return (
    <>
      {/* Banner Principal de Instalación */}
      <div className="install-pwa-banner">
        <div className="install-pwa-content">
          <div className="install-pwa-icon">
            <img 
              src="/icon-192.png" 
              alt="Mi coleccion By IngNavs"
              className="install-pwa-logo"
              onError={(e) => { (e.target as HTMLImageElement).src = '/web/icon-192.png'; }}
            />
          </div>
          
          <div className="install-pwa-text">
            <h3>📱 Instala Mi coleccion By IngNavs</h3>
            <p>
              {isIOS 
                ? 'Agrega la app a tu pantalla de inicio para una experiencia fluida y a pantalla completa.'
                : 'Instala la app para acceso rápido y gestionar tu colección incluso sin conexión.'}
            </p>
          </div>
          
          <div className="install-pwa-actions">
            <button 
              onClick={handleInstallClick}
              className="install-pwa-button install-primary"
            >
              {isIOS ? 'Cómo Instalar' : 'Instalar'}
            </button>
            <button 
              onClick={handleDismiss}
              className="install-pwa-button install-dismiss"
              aria-label="Cerrar"
              title="Cerrar"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      {/* Modal con instrucciones para iOS */}
      {showIOSModal && (
        <div className="modal-overlay" onClick={() => setShowIOSModal(false)} style={{ zIndex: 2000 }}>
          <div 
            className="glass-panel modal-content" 
            style={{ maxWidth: '440px', padding: '2rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <img 
                src="/icon-192.png" 
                alt="Logo"
                style={{ width: '64px', height: '64px', borderRadius: '16px', margin: '0 auto', boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)' }}
                onError={(e) => { (e.target as HTMLImageElement).src = '/web/icon-192.png'; }}
              />
              <h3 className="gradient-text" style={{ margin: '0.75rem 0 0.25rem 0', fontSize: '1.3rem' }}>
                Instalar en iPhone o iPad
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Sigue estos 3 sencillos pasos desde Safari:
              </p>
            </div>

            <div className="ios-steps-list">
              <div className="ios-step-item">
                <div className="ios-step-num">1</div>
                <div className="ios-step-desc">
                  Toca el botón <strong>Compartir</strong> en la barra inferior de Safari:
                  <div style={{ marginTop: '4px', display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '6px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', color: '#38bdf8' }}>
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                      <polyline points="16 6 12 2 8 6"></polyline>
                      <line x1="12" y1="2" x2="12" y2="15"></line>
                    </svg>
                    <span>Ícono de compartir</span>
                  </div>
                </div>
              </div>

              <div className="ios-step-item">
                <div className="ios-step-num">2</div>
                <div className="ios-step-desc">
                  Desliza hacia abajo en el menú y selecciona:
                  <div style={{ marginTop: '4px', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '1.1rem' }}>➕</span>
                    <span>"Agregar a Inicio" (o Añadir a pantalla de inicio)</span>
                  </div>
                </div>
              </div>

              <div className="ios-step-item">
                <div className="ios-step-num">3</div>
                <div className="ios-step-desc">
                  Presiona <strong>"Agregar"</strong> en la esquina superior derecha. ¡Y listo!
                </div>
              </div>
            </div>

            <button 
              className="btn" 
              style={{ marginTop: '1.5rem', width: '100%' }}
              onClick={() => setShowIOSModal(false)}
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}
