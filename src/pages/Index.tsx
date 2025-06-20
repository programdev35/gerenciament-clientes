
import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CustomerForm from '@/components/CustomerForm';
import CustomerDetails from '@/components/CustomerDetails';
import DeleteConfirmation from '@/components/DeleteConfirmation';

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

const Index = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Load customers from localStorage on component mount
  useEffect(() => {
    const savedCustomers = localStorage.getItem('customers');
    if (savedCustomers) {
      setCustomers(JSON.parse(savedCustomers));
    }
  }, []);

  // Save customers to localStorage whenever customers change
  useEffect(() => {
    localStorage.setItem('customers', JSON.stringify(customers));
  }, [customers]);

  const handleAddCustomer = (customerData: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setCustomers([newCustomer, ...customers]);
    setShowForm(false);
  };

  const handleEditCustomer = (customerData: Omit<Customer, 'id' | 'createdAt'>) => {
    if (editingCustomer) {
      const updatedCustomer: Customer = {
        ...customerData,
        id: editingCustomer.id,
        createdAt: editingCustomer.createdAt,
      };
      setCustomers(customers.map(c => c.id === editingCustomer.id ? updatedCustomer : c));
      setEditingCustomer(null);
      setShowForm(false);
    }
  };

  const handleDeleteCustomer = () => {
    if (selectedCustomer) {
      setCustomers(customers.filter(c => c.id !== selectedCustomer.id));
      setSelectedCustomer(null);
      setShowDelete(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  const openEditForm = (customer: Customer) => {
    setEditingCustomer(customer);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Gerenciamento de Clientes
          </h1>
          <p className="text-slate-600">
            Sistema simplificado para cadastro e gerenciamento de clientes
          </p>
        </div>

        {/* Search and Add Button */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nome ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="h-12 px-6 bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-slate-800">{customers.length}</div>
              <p className="text-slate-600">Total de Clientes</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-slate-800">{filteredCustomers.length}</div>
              <p className="text-slate-600">Resultados da Busca</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-slate-800">
                {customers.filter(c => new Date(c.createdAt).toDateString() === new Date().toDateString()).length}
              </div>
              <p className="text-slate-600">Cadastrados Hoje</p>
            </CardContent>
          </Card>
        </div>

        {/* Customer List */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-800">Lista de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-slate-400 text-lg mb-2">
                  {customers.length === 0 ? 'Nenhum cliente cadastrado' : 'Nenhum cliente encontrado'}
                </div>
                <p className="text-slate-500">
                  {customers.length === 0 
                    ? 'Adicione seu primeiro cliente clicando no botão "Novo Cliente"'
                    : 'Tente ajustar os termos da busca'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800 mb-1">{customer.name}</h3>
                      <div className="flex flex-wrap gap-2 text-sm text-slate-600">
                        <span>{formatPhone(customer.phone)}</span>
                        <span>•</span>
                        <span>{customer.city}, {customer.state}</span>
                        {customer.referencePoint && (
                          <>
                            <span>•</span>
                            <Badge variant="outline" className="text-xs">
                              {customer.referencePoint}
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDetails(customer)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditForm(customer)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteConfirmation(customer)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
          <CustomerForm
            customer={editingCustomer}
            onSubmit={editingCustomer ? handleEditCustomer : handleAddCustomer}
            onClose={() => {
              setShowForm(false);
              setEditingCustomer(null);
            }}
          />
        )}

        {showDetails && selectedCustomer && (
          <CustomerDetails
            customer={selectedCustomer}
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
    </div>
  );
};

export default Index;
