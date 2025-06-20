
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomerFormData } from '@/hooks/useCustomers';

interface MobileOptimizedFormProps {
  customer?: CustomerFormData | null;
  onSubmit: (customer: CustomerFormData) => void;
  onClose: () => void;
}

const MobileOptimizedForm = ({ customer, onSubmit, onClose }: MobileOptimizedFormProps) => {
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    phone: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: 'Itabuna',
    state: 'BA',
    zipCode: '',
    referencePoint: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  useEffect(() => {
    if (customer) {
      setFormData(customer);
    }
  }, [customer]);

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
        if (!formData.phone.trim()) {
          newErrors.phone = 'Telefone é obrigatório';
        } else if (!/^\d{10,11}$/.test(formData.phone.replace(/\D/g, ''))) {
          newErrors.phone = 'Telefone deve ter 10 ou 11 dígitos';
        }
        break;
      case 2:
        if (!formData.street.trim()) newErrors.street = 'Rua é obrigatória';
        if (!formData.number.trim()) newErrors.number = 'Número é obrigatório';
        if (!formData.neighborhood.trim()) newErrors.neighborhood = 'Bairro é obrigatório';
        break;
      case 3:
        if (!formData.city.trim()) newErrors.city = 'Cidade é obrigatória';
        if (!formData.state.trim()) newErrors.state = 'Estado é obrigatório';
        if (!formData.zipCode.trim()) {
          newErrors.zipCode = 'CEP é obrigatório';
        } else if (!/^\d{8}$/.test(formData.zipCode.replace(/\D/g, ''))) {
          newErrors.zipCode = 'CEP deve ter 8 dígitos';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      onSubmit(formData);
    }
  };

  const handlePhoneChange = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    let formatted = numbers;
    
    if (numbers.length >= 11) {
      formatted = numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (numbers.length >= 10) {
      formatted = numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else if (numbers.length >= 6) {
      formatted = numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else if (numbers.length >= 2) {
      formatted = numbers.replace(/(\d{2})(\d{0,5})/, '($1) $2');
    }
    
    setFormData({ ...formData, phone: formatted });
  };

  const handleZipCodeChange = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const formatted = numbers.replace(/(\d{5})(\d{0,3})/, '$1-$2');
    setFormData({ ...formData, zipCode: formatted });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="name" className="text-base font-medium">Nome Completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`mt-2 h-12 text-base ${errors.name ? 'border-red-500' : ''}`}
                placeholder="Digite o nome completo"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="phone" className="text-base font-medium">Telefone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="(11) 99999-9999"
                className={`mt-2 h-12 text-base ${errors.phone ? 'border-red-500' : ''}`}
                inputMode="tel"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="street" className="text-base font-medium">Rua *</Label>
              <Input
                id="street"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                className={`mt-2 h-12 text-base ${errors.street ? 'border-red-500' : ''}`}
                placeholder="Nome da rua"
              />
              {errors.street && <p className="text-red-500 text-sm mt-1">{errors.street}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="number" className="text-base font-medium">Número *</Label>
                <Input
                  id="number"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  className={`mt-2 h-12 text-base ${errors.number ? 'border-red-500' : ''}`}
                  placeholder="123"
                />
                {errors.number && <p className="text-red-500 text-sm mt-1">{errors.number}</p>}
              </div>

              <div>
                <Label htmlFor="complement" className="text-base font-medium">Complemento</Label>
                <Input
                  id="complement"
                  value={formData.complement}
                  onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                  placeholder="Apto 101"
                  className="mt-2 h-12 text-base"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="neighborhood" className="text-base font-medium">Bairro *</Label>
              <Input
                id="neighborhood"
                value={formData.neighborhood}
                onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                className={`mt-2 h-12 text-base ${errors.neighborhood ? 'border-red-500' : ''}`}
                placeholder="Nome do bairro"
              />
              {errors.neighborhood && <p className="text-red-500 text-sm mt-1">{errors.neighborhood}</p>}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="city" className="text-base font-medium">Cidade *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className={`mt-2 h-12 text-base ${errors.city ? 'border-red-500' : ''}`}
                placeholder="Nome da cidade"
              />
              {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="state" className="text-base font-medium">Estado *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="BA"
                  className={`mt-2 h-12 text-base ${errors.state ? 'border-red-500' : ''}`}
                  maxLength={2}
                />
                {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
              </div>

              <div>
                <Label htmlFor="zipCode" className="text-base font-medium">CEP *</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => handleZipCodeChange(e.target.value)}
                  placeholder="12345-678"
                  className={`mt-2 h-12 text-base ${errors.zipCode ? 'border-red-500' : ''}`}
                  inputMode="numeric"
                />
                {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="referencePoint" className="text-base font-medium">Ponto de Referência</Label>
              <Input
                id="referencePoint"
                value={formData.referencePoint}
                onChange={(e) => setFormData({ ...formData, referencePoint: e.target.value })}
                placeholder="Próximo ao mercado..."
                className="mt-2 h-12 text-base"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
      <Card className="w-full max-w-md max-h-[90vh] sm:max-h-[80vh] overflow-y-auto sm:rounded-lg rounded-t-3xl rounded-b-none sm:rounded-b-lg">
        <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-white z-10 border-b">
          <div>
            <CardTitle className="text-xl font-semibold">
              {customer ? 'Editar Cliente' : 'Novo Cliente'}
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Passo {currentStep} de {totalSteps}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>

        <CardContent className="p-6">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === currentStep
                      ? 'bg-orange-500 text-white'
                      : step < currentStep
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {renderStep()}

            <div className="flex gap-3 mt-8 pt-6 border-t">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  className="flex-1 h-12"
                >
                  Anterior
                </Button>
              )}
              
              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 h-12 bg-orange-500 hover:bg-orange-600"
                >
                  Próximo
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="flex-1 h-12 bg-green-600 hover:bg-green-700"
                >
                  {customer ? 'Atualizar' : 'Cadastrar'}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileOptimizedForm;
