
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

  // Detectar dispositivos e browsers com mais precisão
  const userAgent = navigator.userAgent.toLowerCase();
  const isIOS = /ipad|iphone|ipod/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /android/.test(userAgent);
  const isMobile = isIOS || isAndroid || /mobile/.test(userAgent);
  const isChrome = /chrome/.test(userAgent) && !/edg/.test(userAgent);
  const isEdge = /edg/.test(userAgent);
  const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
  const isFirefox = /firefox/.test(userAgent);
  
  // Pode instalar se for um browser compatível
  const canInstall = (isChrome || isEdge || isFirefox) || (isIOS && isSafari);

  useEffect(() => {
    console.log('PWA Hook initialized', {
      userAgent: navigator.userAgent,
      isIOS,
      isAndroid,
      isMobile,
      isChrome,
      isEdge,
      isSafari,
      canInstall
    });

    // Verificar se já está instalado
    const checkIfInstalled = () => {
      // Verificar display mode
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      // Verificar iOS standalone
      const isIOSStandalone = (window.navigator as any).standalone === true;
      // Verificar se foi lançado de uma tela inicial
      const isLaunchedFromHomeScreen = window.location.search.includes('utm_source=homescreen') || 
                                       window.location.search.includes('source=pwa');
      
      return isStandalone || isIOSStandalone || isLaunchedFromHomeScreen;
    };

    const isCurrentlyInstalled = checkIfInstalled();
    setIsInstalled(isCurrentlyInstalled);
    
    if (isCurrentlyInstalled) {
      console.log('App já está instalado ou rodando como PWA');
      return;
    }

    // Listener para o evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt event capturado!', e);
      e.preventDefault();
      const beforeInstallPromptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(beforeInstallPromptEvent);
      setIsInstallable(true);
      
      // Mostrar prompt após 2 segundos se não foi dispensado
      setTimeout(() => {
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (!dismissed) {
          console.log('Mostrando prompt de instalação');
          setShowInstallPrompt(true);
        }
      }, 2000);
    };

    // Listener para detectar quando o PWA foi instalado
    const handleAppInstalled = (e: Event) => {
      console.log('App instalado com sucesso!', e);
      setIsInstalled(true);
      setIsInstallable(false);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      // Limpar o flag de dispensado
      localStorage.removeItem('pwa-install-dismissed');
    };

    // Listeners para status online/offline
    const handleOnline = () => {
      console.log('Aplicação online');
      setIsOnline(true);
    };
    
    const handleOffline = () => {
      console.log('Aplicação offline');
      setIsOnline(false);
    };

    // Para navegadores que suportam beforeinstallprompt
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Para iOS ou outros casos onde não há beforeinstallprompt
    if (canInstall && !isCurrentlyInstalled) {
      // Aguardar um pouco para o usuário se familiarizar com a página
      setTimeout(() => {
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (!dismissed) {
          console.log('Mostrando prompt de instalação (fallback para navegadores sem beforeinstallprompt)');
          setShowInstallPrompt(true);
        }
      }, 3000);
    }

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [canInstall]);

  const installApp = async (): Promise<void> => {
    console.log('installApp chamada', { 
      deferredPrompt: !!deferredPrompt, 
      isIOS, 
      canInstall,
      isInstallable 
    });
    
    // Se for iOS, as instruções são mostradas no componente
    if (isIOS) {
      console.log('iOS detectado - instruções serão mostradas');
      return;
    }

    // Se temos o prompt nativo, usar ele
    if (deferredPrompt) {
      try {
        console.log('Usando prompt nativo do navegador');
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        console.log('Resposta do usuário:', outcome);
        
        if (outcome === 'accepted') {
          console.log('Usuário aceitou a instalação');
        } else {
          console.log('Usuário recusou a instalação');
        }
        
        // Limpar o prompt usado
        setDeferredPrompt(null);
        setIsInstallable(false);
        setShowInstallPrompt(false);
        
      } catch (error) {
        console.error('Erro ao instalar PWA:', error);
        // Se der erro, mostrar instruções manuais
        alert('Para instalar o app:\n1. Clique no ícone de instalação na barra de endereço\n2. Ou use o menu do navegador > "Instalar aplicativo"');
      }
    } else {
      // Fallback: instruções manuais para instalação
      console.log('Sem prompt nativo disponível, mostrando instruções');
      
      let instructions = '';
      if (isChrome || isEdge) {
        instructions = 'Para instalar o app:\n1. Clique no ícone de instalação na barra de endereço (ao lado da URL)\n2. Ou use Ctrl/Cmd + Shift + A\n3. Ou vá no menu ⋮ > "Instalar aplicativo"';
      } else if (isFirefox) {
        instructions = 'Para instalar o app no Firefox:\n1. Vá no menu ☰\n2. Selecione "Instalar este site como aplicativo"';
      } else {
        instructions = 'Para instalar o app:\n1. Use o menu do seu navegador\n2. Procure por "Instalar aplicativo" ou "Adicionar à tela inicial"';
      }
      
      alert(instructions);
    }
  };

  const hideInstallPrompt = () => {
    console.log('Ocultando prompt de instalação');
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
