
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useUsers } from '@/hooks/useUsers';
import CreateUserForm from '@/components/CreateUserForm';
import UserList from '@/components/UserList';
import { Shield, Users, Plus, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Admin = () => {
  const { user } = useAuth();
  const { users, loading, refetch, toggleUserRole } = useUsers();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleUserCreated = () => {
    refetch();
    setShowCreateForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-3">
                <Shield className="h-8 w-8 text-orange-500" />
                Painel Administrativo
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Gerencie usuários e configurações do sistema
              </p>
            </div>
            
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Logado como: <span className="font-medium">{user?.email}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                  <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    {users.length}
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Total de Usuários
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    {users.filter(u => u.role === 'admin').length}
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Administradores
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    {users.filter(u => u.role === 'user').length}
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Usuários Padrão
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Button */}
        <div className="mb-6">
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            {showCreateForm ? 'Cancelar' : 'Criar Usuário'}
          </Button>
        </div>

        {/* Create User Form */}
        {showCreateForm && (
          <div className="mb-6">
            <CreateUserForm onUserCreated={handleUserCreated} />
          </div>
        )}

        {/* User List */}
        <UserList 
          users={users} 
          loading={loading} 
          onToggleRole={toggleUserRole}
        />
      </div>
    </div>
  );
};

export default Admin;
