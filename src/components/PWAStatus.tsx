
import { Wifi, WifiOff, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { usePWA } from '@/hooks/usePWA';

const PWAStatus = () => {
  const { isOnline, isInstalled } = usePWA();

  return (
    <div className="flex items-center gap-2">
      {/* Status de conexão */}
      <Badge 
        variant={isOnline ? "default" : "destructive"} 
        className="flex items-center gap-1"
      >
        {isOnline ? (
          <>
            <Wifi className="h-3 w-3" />
            Online
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3" />
            Offline
          </>
        )}
      </Badge>

      {/* Status de instalação */}
      {isInstalled && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Download className="h-3 w-3" />
          Instalado
        </Badge>
      )}
    </div>
  );
};

export default PWAStatus;
