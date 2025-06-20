
import { useState, useEffect } from 'react';
import { X, Download, Monitor, Smartphone, Wifi, Share, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { usePWA } from '@/hooks/usePWA';

const PWAInstallAlert = () => {
  const { 
    isInstallable, 
    installApp, 
    isInstalled, 
    isOnline, 
    isIOS, 
    isMobile, 
    canInstall,
    deferredPrompt,
    showInstallPrompt,
    hideInstallPrompt
  } = usePWA();
  
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  const handleInstall = async () => {
    console.log('handleInstall chamado', { isIOS, deferredPrompt: !!deferredPrompt });
    
    if (isIOS) {
      setShowIOSInstructions(true);
    } else {
      await installApp();
    }
  };

  // Não mostrar se estiver instalado, offline, não puder instalar, ou o prompt não estiver ativo
  if (isInstalled || !isOnline || !canInstall || !showInstallPrompt) {
    return null;
  }

  console.log('PWAInstallAlert renderizando', {
    isInstalled,
    isOnline,
    canInstall,
    showInstallPrompt,
    isIOS,
    deferredPrompt: !!deferredPrompt
  });

  const IOSInstructionsModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-sm w-full shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
            Como Instalar no iOS
          </h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setShowIOSInstructions(false);
              hideInstallPrompt();
            }}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              1
            </div>
            <div className="flex items-center gap-2">
              <Share className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                Toque no botão "Compartilhar" (ícone de seta para cima)
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              2
            </div>
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                Role para baixo e selecione "Adicionar à Tela de Início"
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              3
            </div>
            <span className="text-sm text-slate-700 dark:text-slate-300">
              Confirme tocando em "Adicionar" no canto superior direito
            </span>
          </div>
        </div>
        
        <div className="text-xs text-slate-500 dark:text-slate-400 text-center mt-4 p-2 bg-slate-50 dark:bg-slate-700 rounded">
          💡 O app aparecerá na sua tela inicial como um aplicativo nativo
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-black/20 to-transparent">
        <Alert className="max-w-4xl mx-auto bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-2 border-orange-200 dark:border-orange-700 shadow-2xl">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Download className="h-6 w-6 text-white" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-lg text-orange-900 dark:text-orange-100">
                  📱 Instale nosso App!
                </h3>
                <Badge variant="secondary" className="bg-orange-200 text-orange-800 dark:bg-orange-800 dark:text-orange-200">
                  Grátis
                </Badge>
              </div>
              
              <AlertDescription className="text-orange-800 dark:text-orange-200 mb-4">
                <div className="space-y-2">
                  <p className="font-medium">
                    Tenha acesso rápido ao sistema de gestão de clientes diretamente da sua tela inicial!
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      <span>Funciona no desktop</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      <span>Otimizado para mobile</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wifi className="h-4 w-4" />
                      <span>Funciona offline</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      <span>Sem downloads externos</span>
                    </div>
                  </div>
                </div>
              </AlertDescription>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleInstall}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 shadow-lg"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isIOS ? 'Ver Instruções' : 'Instalar Agora'}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={hideInstallPrompt}
                  className="border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-600 dark:text-orange-300 dark:hover:bg-orange-900/20"
                >
                  Talvez depois
                </Button>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={hideInstallPrompt}
              className="flex-shrink-0 text-orange-600 hover:text-orange-700 hover:bg-orange-100 dark:text-orange-400 dark:hover:text-orange-300 dark:hover:bg-orange-900/20 rounded-full h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Alert>
      </div>

      {showIOSInstructions && <IOSInstructionsModal />}
    </>
  );
};

export default PWAInstallAlert;
