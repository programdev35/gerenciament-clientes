
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Customer {
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

interface CustomerDetailsProps {
  customer: Customer;
  onClose: () => void;
}

const CustomerDetails = ({ customer, onClose }: CustomerDetailsProps) => {
  const formatPhone = (phone: string) => {
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const formatZipCode = (zipCode: string) => {
    return zipCode.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const fullAddress = [
    customer.street,
    customer.number,
    customer.complement,
    customer.neighborhood,
    customer.city,
    customer.state,
    formatZipCode(customer.zipCode)
  ].filter(Boolean).join(', ');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold">Detalhes do Cliente</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-3">Informações Pessoais</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-600">Nome Completo</label>
                <p className="text-slate-800 text-lg">{customer.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Telefone</label>
                <p className="text-slate-800">{formatPhone(customer.phone)}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Address Information */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-3">Endereço</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-600">Endereço Completo</label>
                <p className="text-slate-800">{fullAddress}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Rua</label>
                  <p className="text-slate-800">{customer.street}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Número</label>
                  <p className="text-slate-800">{customer.number}</p>
                </div>
              </div>

              {customer.complement && (
                <div>
                  <label className="text-sm font-medium text-slate-600">Complemento</label>
                  <p className="text-slate-800">{customer.complement}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Bairro</label>
                  <p className="text-slate-800">{customer.neighborhood}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">CEP</label>
                  <p className="text-slate-800">{formatZipCode(customer.zipCode)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Cidade</label>
                  <p className="text-slate-800">{customer.city}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Estado</label>
                  <p className="text-slate-800">{customer.state}</p>
                </div>
              </div>

              {customer.referencePoint && (
                <div>
                  <label className="text-sm font-medium text-slate-600">Ponto de Referência</label>
                  <div className="mt-1">
                    <Badge variant="outline" className="text-sm">
                      {customer.referencePoint}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Metadata */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-3">Informações do Sistema</h3>
            <div>
              <label className="text-sm font-medium text-slate-600">Data de Cadastro</label>
              <p className="text-slate-800">{formatDate(customer.createdAt)}</p>
            </div>
          </div>

          <div className="pt-4">
            <Button onClick={onClose} className="w-full">
              Fechar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerDetails;
