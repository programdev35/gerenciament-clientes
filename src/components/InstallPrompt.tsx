
import { useState } from 'react';
import { X, Download, Share, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePWA } from '@/hooks/usePWA';

const InstallPrompt = () => {
  const { 
    isInstallable, 
    installApp, 
    showInstallPrompt, 
    hideInstallPrompt, 
    isIOS, 
    isMobile,
    deferredPrompt 
  } = usePWA();
  
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  // Só mostrar se tiver o prompt nativo ou for iOS
  if (!showInstallPrompt || (!deferredPrompt && !isIOS)) return null;

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
    } else {
      await installApp();
    }
  };

  const IOSInstructions = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Como Instalar no iOS</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setShowIOSInstructions(false);
              hideInstallPrompt();
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">1</span>
              </div>
              <div className="flex items-center gap-2">
                <Share className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Toque no botão "Compartilhar"</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">2</span>
              </div>
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Selecione "Adicionar à Tela de Início"</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">3</span>
              </div>
              <span className="text-sm">Confirme tocando em "Adicionar"</span>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 text-center mt-4">
            O app aparecerá na sua tela inicial como um aplicativo nativo
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <>
      <div className="fixed bottom-4 left-4 right-4 z-40">
        <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Download className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Instalar App</h3>
                  <p className="text-sm text-gray-600">
                    Adicione à tela inicial para acesso rápido
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={hideInstallPrompt}
                  className="text-gray-500"
                >
                  Depois
                </Button>
                <Button 
                  onClick={handleInstall}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                  size="sm"
                >
                  {isIOS ? 'Como Instalar' : 'Instalar'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {showIOSInstructions && <IOSInstructions />}
    </>
  );
};

export default InstallPrompt;
