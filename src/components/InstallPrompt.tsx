import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallPromptProps {
  compact?: boolean;
}

export const InstallPrompt = ({ compact = false }: InstallPromptProps) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    // Verificar si ya está instalada
    if (window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true) {
      return;
    }

    // Escuchar el evento beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Escuchar el evento de instalación exitosa
    window.addEventListener('appinstalled', () => {
      setShowInstall(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setShowInstall(false);
      }
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error instalando PWA:', error);
    }
  };

  const handleClose = () => {
    setShowInstall(false);
  };

  if (!showInstall || !deferredPrompt) return null;

  if (compact) {
    return (
      <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-indigo-500 rounded">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">📱</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">Instala la app</p>
              <p className="text-xs text-gray-600">Acceso rápido sin descargar</p>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={handleInstall}
              className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded hover:bg-indigo-700 transition-colors"
            >
              Instalar
            </button>
            <button
              onClick={handleClose}
              className="px-2 py-1.5 text-gray-500 hover:text-gray-700 text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
