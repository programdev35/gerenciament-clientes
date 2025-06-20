
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserData } from '@/hooks/useUsers';
import { Shield, User, Calendar } from 'lucide-react';

interface UserListProps {
  users: UserData[];
  loading: boolean;
  onToggleRole: (userId: string, currentRole: 'admin' | 'user') => void;
}

const UserList = ({ users, loading, onToggleRole }: UserListProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carregando usuários...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Usuários do Sistema ({users.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500">Nenhum usuário encontrado</p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                      {user.name || 'Nome não informado'}
                    </h3>
                    <Badge 
                      variant={user.role === 'admin' ? 'default' : 'secondary'}
                      className={user.role === 'admin' ? 'bg-orange-500 hover:bg-orange-600' : ''}
                    >
                      {user.role === 'admin' ? (
                        <>
                          <Shield className="h-3 w-3 mr-1" />
                          Admin
                        </>
                      ) : (
                        <>
                          <User className="h-3 w-3 mr-1" />
                          Usuário
                        </>
                      )}
                    </Badge>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    {user.email}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <Calendar className="h-3 w-3" />
                    <span>Criado em {formatDate(user.created_at)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onToggleRole(user.id, user.role || 'user')}
                  >
                    {user.role === 'admin' ? 'Remover Admin' : 'Tornar Admin'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserList;
