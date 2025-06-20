
import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAHook {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  installApp: () => Promise<void>;
  deferredPrompt: BeforeInstallPromptEvent | null;
  showInstallPrompt: boolean;
  hideInstallPrompt: () => void;
  isIOS: boolean;
  isMobile: boolean;
  canInstall: boolean;
}

export const usePWA = (): PWAHook => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  // Detectar dispositivos e browsers
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
  const isEdge = /Edg/.test(navigator.userAgent);
  const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
  
  // Pode instalar se for Chrome/Edge no desktop ou mobile, ou Safari no iOS
  const canInstall = (isChrome || isEdge) || (isIOS && isSafari);

  useEffect(() => {
    // Verificar se já está instalado
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      return isStandalone || isIOSStandalone;
    };

    if (checkIfInstalled()) {
      setIsInstalled(true);
      console.log('App já está instalado');
      return;
    }

    // Listener para o evento beforeinstallprompt (Chrome/Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt event fired');
      e.preventDefault();
      const beforeInstallPromptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(beforeInstallPromptEvent);
      setIsInstallable(true);
      
      // Mostrar prompt após 3 segundos
      setTimeout(() => {
        if (!localStorage.getItem('pwa-install-dismissed')) {
          setShowInstallPrompt(true);
        }
      }, 3000);
    };

    // Listener para detectar quando o PWA foi instalado
    const handleAppInstalled = () => {
      console.log('App installed successfully');
      setIsInstalled(true);
      setIsInstallable(false);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    // Listeners para status online/offline
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Para iOS Safari, sempre mostrar instruções se não estiver instalado
    if (isIOS && !checkIfInstalled()) {
      setTimeout(() => {
        if (!localStorage.getItem('pwa-install-dismissed')) {
          setShowInstallPrompt(true);
        }
      }, 3000);
    }

    // Adicionar event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isIOS]);

  const installApp = async (): Promise<void> => {
    console.log('installApp called', { deferredPrompt, isIOS, canInstall });
    
    if (isIOS) {
      // Para iOS, apenas mostrar instruções
      console.log('iOS detected - showing instructions');
      return;
    }

    if (!deferredPrompt) {
      console.log('No deferred prompt available');
      return;
    }

    try {
      console.log('Prompting for install');
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log('User choice:', outcome);
      
      if (outcome === 'accepted') {
        console.log('User accepted install');
        setIsInstalled(true);
      } else {
        console.log('User declined install');
      }
      
      setDeferredPrompt(null);
      setIsInstallable(false);
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('Error installing PWA:', error);
    }
  };

  const hideInstallPrompt = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  return {
    isInstallable,
    isInstalled,
    isOnline,
    installApp,
    deferredPrompt,
    showInstallPrompt,
    hideInstallPrompt,
    isIOS,
    isMobile,
    canInstall,
  };
};
