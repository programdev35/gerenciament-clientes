
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useCustomers } from '@/hooks/useCustomers';
import { useAuth } from '@/hooks/useAuth';
import { Download, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface LocalCustomer {
  id: string;
  name: string;
  phone: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  referencePoint?: string;
  createdAt: Date;
}

const DataMigration = () => {
  const [localCustomers, setLocalCustomers] = useState<LocalCustomer[]>([]);
  const [migrating, setMigrating] = useState(false);
  const [migrated, setMigrated] = useState(false);
  const [progress, setProgress] = useState(0);
  const { createCustomer } = useCustomers();
  const { user } = useAuth();

  useEffect(() => {
    // Check for local data
    const savedCustomers = localStorage.getItem('customers');
    if (savedCustomers) {
      try {
        const customers = JSON.parse(savedCustomers);
        setLocalCustomers(customers);
      } catch (error) {
        console.error('Error parsing local customers:', error);
      }
    }

    // Check if migration was already done
    const migrationDone = localStorage.getItem('migration_completed');
    if (migrationDone) {
      setMigrated(true);
    }
  }, []);

  const startMigration = async () => {
    if (!user || localCustomers.length === 0) return;

    setMigrating(true);
    setProgress(0);

    try {
      for (let i = 0; i < localCustomers.length; i++) {
        const customer = localCustomers[i];
        
        // Convert local customer format to new format
        const customerData = {
          name: customer.name,
          phone: customer.phone,
          street: customer.street,
          number: customer.number,
          complement: customer.complement,
          neighborhood: customer.neighborhood,
          city: customer.city,
          state: customer.state,
          zipCode: customer.zipCode,
          referencePoint: customer.referencePoint,
        };

        createCustomer(customerData);
        
        // Update progress
        const newProgress = Math.round(((i + 1) / localCustomers.length) * 100);
        setProgress(newProgress);
        
        // Small delay to prevent overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Mark migration as completed
      localStorage.setItem('migration_completed', 'true');
      setMigrated(true);
      toast.success(`${localCustomers.length} clientes migrados com sucesso!`);
      
    } catch (error) {
      console.error('Migration error:', error);
      toast.error('Erro durante a migração. Alguns clientes podem não ter sido migrados.');
    } finally {
      setMigrating(false);
    }
  };

  const clearLocalData = () => {
    localStorage.removeItem('customers');
    localStorage.removeItem('migration_completed');
    setLocalCustomers([]);
    setMigrated(false);
    toast.success('Dados locais removidos com sucesso!');
  };

  if (localCustomers.length === 0 && !migrated) {
    return null; // No local data to migrate
  }

  return (
    <Card className="mb-6 border-blue-200 dark:border-blue-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
          {migrated ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <Download className="h-5 w-5" />
          )}
          Migração de Dados
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!migrated ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <AlertCircle className="h-4 w-4" />
              <span>
                Encontramos {localCustomers.length} cliente(s) salvos localmente. 
                Deseja migrar para a nuvem?
              </span>
            </div>
            
            {migrating && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-center text-slate-600 dark:text-slate-400">
                  Migrando dados... {progress}%
                </p>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button
                onClick={startMigration}
                disabled={migrating || !user}
                className="flex-1"
              >
                {migrating ? 'Migrando...' : 'Migrar Dados'}
              </Button>
              <Button
                variant="outline"
                onClick={clearLocalData}
                disabled={migrating}
              >
                Limpar Dados Locais
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-green-700 dark:text-green-300">
              ✅ Migração concluída! Seus dados estão seguros na nuvem.
            </p>
            <Button
              variant="outline"
              onClick={clearLocalData}
              size="sm"
            >
              Limpar Dados Locais Antigos
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DataMigration;
