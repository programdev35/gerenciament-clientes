
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface UserData {
  id: string;
  email: string;
  name?: string;
  created_at: string;
  role?: 'admin' | 'user';
}

export const useUsers = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  const fetchUsers = async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    try {
      // Fetch profiles with user roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) {
        console.error('Erro ao buscar perfis:', profilesError);
        setLoading(false);
        return;
      }

      // Fetch user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) {
        console.error('Erro ao buscar roles:', rolesError);
      }

      // Combine data
      const usersData: UserData[] = profiles?.map(profile => ({
        id: profile.id,
        email: profile.email || '',
        name: profile.name || '',
        created_at: profile.created_at,
        role: roles?.find(r => r.user_id === profile.id)?.role || 'user'
      })) || [];

      setUsers(usersData);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserRole = async (userId: string, currentRole: 'admin' | 'user') => {
    if (!isAdmin) return;

    const newRole = currentRole === 'admin' ? 'user' : 'admin';

    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: newRole
        });

      if (error) {
        console.error('Erro ao alterar role:', error);
        return;
      }

      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
    } catch (error) {
      console.error('Erro ao alterar role:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [isAdmin]);

  return {
    users,
    loading,
    refetch: fetchUsers,
    toggleUserRole
  };
};
