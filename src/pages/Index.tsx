
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Search, Plus, Edit, Trash2, Eye, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CustomerForm from '@/components/CustomerForm';
import MobileOptimizedForm from '@/components/MobileOptimizedForm';
import CustomerDetails from '@/components/CustomerDetails';
import DeleteConfirmation from '@/components/DeleteConfirmation';
import DataMigration from '@/components/DataMigration';
import ThemeToggle from '@/components/ThemeToggle';
import InstallPrompt from '@/components/InstallPrompt';
import PWAStatus from '@/components/PWAStatus';
import { useAuth } from '@/hooks/useAuth';
import { useCustomers, Customer, CustomerFormData } from '@/hooks/useCustomers';
import { usePWA } from '@/hooks/usePWA';

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const { customers, isLoading, createCustomer, updateCustomer, deleteCustomer } = useCustomers();
  const { isMobile } = usePWA();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerFormData | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Redirect to auth if not authenticated
  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Carregando...</p>
        </div>
      </div>
    );
  }

  const handleAddCustomer = (customerData: CustomerFormData) => {
    createCustomer(customerData);
    setShowForm(false);
  };

  const handleEditCustomer = (customerData: CustomerFormData) => {
    if (editingCustomer && selectedCustomer) {
      updateCustomer({ id: selectedCustomer.id, customerData });
      setEditingCustomer(null);
      setSelectedCustomer(null);
      setShowForm(false);
    }
  };

  const handleDeleteCustomer = () => {
    if (selectedCustomer) {
      deleteCustomer(selectedCustomer.id);
      setSelectedCustomer(null);
      setShowDelete(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  const openEditForm = (customer: Customer) => {
    const formData = customerToFormData(customer);
    setEditingCustomer(formData);
    setSelectedCustomer(customer);
    setShowForm(true);
  };

  const openDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDetails(true);
  };

  const openDeleteConfirmation = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDelete(true);
  };

  const formatPhone = (phone: string) => {
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const formatZipCode = (zipCode: string) => {
    return zipCode.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const getFullAddress = (customer: Customer) => {
    const parts = [
      customer.street,
      customer.number,
      customer.complement,
      customer.neighborhood,
      customer.city,
      customer.state,
      formatZipCode(customer.zip_code)
    ].filter(Boolean);
    return parts.join(', ');
  };

  const getTodayCustomers = () => {
    const today = new Date().toDateString();
    return customers.filter(c => new Date(c.created_at).toDateString() === today).length;
  };

  // Convert Customer to CustomerFormData for editing
  const customerToFormData = (customer: Customer): CustomerFormData => ({
    name: customer.name,
    phone: formatPhone(customer.phone),
    street: customer.street,
    number: customer.number,
    complement: customer.complement || '',
    neighborhood: customer.neighborhood,
    city: customer.city,
    state: customer.state,
    zipCode: formatZipCode(customer.zip_code),
    referencePoint: customer.reference_point || '',
  });

  const FormComponent = isMobile ? MobileOptimizedForm : CustomerForm;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 dark:from-slate-900 dark:to-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                Gestão de Clientes
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
                Sistema profissional para cadastro e gerenciamento
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <PWAStatus />
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{user?.email}</span>
              </div>
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Data Migration Component */}
        <DataMigration />

        {/* Search and Add Button - Mobile Optimized */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 h-4 w-4" />
            <Input
              placeholder="Buscar por nome ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 sm:h-10 text-base sm:text-sm border-slate-200 dark:border-slate-700 focus:border-orange-500 focus:ring-orange-500 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="h-12 sm:h-10 px-6 bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-500 transition-colors text-white font-medium"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
        </div>

        {/* Stats - Mobile Optimized */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-800">
            <CardContent className="pt-4 sm:pt-6">
              <div className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">{customers.length}</div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Total de Clientes</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-800">
            <CardContent className="pt-4 sm:pt-6">
              <div className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">{filteredCustomers.length}</div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Resultados da Busca</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-800">
            <CardContent className="pt-4 sm:pt-6">
              <div className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
                {getTodayCustomers()}
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Cadastrados Hoje</p>
            </CardContent>
          </Card>
        </div>

        {/* Customer List - Mobile Optimized */}
        <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-800 dark:text-slate-100">Lista de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="text-slate-400 dark:text-slate-500 text-base sm:text-lg mb-2">
                  {customers.length === 0 ? 'Nenhum cliente cadastrado' : 'Nenhum cliente encontrado'}
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  {customers.length === 0 
                    ? 'Adicione seu primeiro cliente'
                    : 'Tente ajustar os termos da busca'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className="flex items-start justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1 truncate">{customer.name}</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-slate-600 dark:text-slate-400 mb-1">
                        <span>{formatPhone(customer.phone)}</span>
                        {customer.reference_point && (
                          <>
                            <span className="hidden sm:inline">•</span>
                            <Badge variant="outline" className="text-xs dark:border-slate-600 dark:text-slate-300 w-fit">
                              {customer.reference_point}
                            </Badge>
                          </>
                        )}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 truncate">
                        <span>{getFullAddress(customer)}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 sm:gap-2 flex-shrink-0 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDetails(customer)}
                        className="dark:hover:bg-slate-600 h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditForm(customer)}
                        className="dark:hover:bg-slate-600 h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteConfirmation(customer)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modals */}
        {showForm && (
          <FormComponent
            customer={editingCustomer}
            onSubmit={editingCustomer ? handleEditCustomer : handleAddCustomer}
            onClose={() => {
              setShowForm(false);
              setEditingCustomer(null);
              setSelectedCustomer(null);
            }}
          />
        )}

        {showDetails && selectedCustomer && (
          <CustomerDetails
            customer={{
              ...selectedCustomer,
              createdAt: new Date(selectedCustomer.created_at),
              zipCode: selectedCustomer.zip_code,
              referencePoint: selectedCustomer.reference_point,
            }}
            onClose={() => setShowDetails(false)}
          />
        )}

        {showDelete && selectedCustomer && (
          <DeleteConfirmation
            customerName={selectedCustomer.name}
            onConfirm={handleDeleteCustomer}
            onClose={() => setShowDelete(false)}
          />
        )}
      </div>

      {/* PWA Install Prompt */}
      <InstallPrompt />
    </div>
  );
};

export default Index;
