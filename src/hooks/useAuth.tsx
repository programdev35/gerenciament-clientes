
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  checkUserRole: () => Promise<void>;
  createUser: (email: string, password: string, name: string) => Promise<{ error?: any }>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkUserRole = async () => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });

      if (error) {
        console.error('Erro ao verificar role:', error);
        setIsAdmin(false);
      } else {
        setIsAdmin(data || false);
      }
    } catch (error) {
      console.error('Erro ao verificar role:', error);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Check user role after authentication
        if (session?.user) {
          setTimeout(() => {
            checkUserRole();
          }, 0);
        } else {
          setIsAdmin(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        setTimeout(() => {
          checkUserRole();
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Update checkUserRole when user changes
  useEffect(() => {
    if (user) {
      checkUserRole();
    }
  }, [user]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        toast.error(error.message);
        return { error };
      }

      toast.success('Login realizado com sucesso!');
      return {};
    } catch (error) {
      toast.error('Erro inesperado no login');
      return { error };
    }
  };

  const createUser = async (email: string, password: string, name: string) => {
    try {
      if (!isAdmin) {
        toast.error('Acesso negado. Apenas administradores podem criar usuários.');
        return { error: 'Unauthorized' };
      }

      console.log('Iniciando criação de usuário...', { email, name });

      // Usar a Edge Function para criar usuário sem fazer auto-login
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: {
          email,
          password,
          name
        }
      });

      console.log('Resposta completa da Edge Function:', { data, error });

      if (error) {
        console.error('Erro ao invocar função:', error);
        let errorMessage = 'Erro ao criar usuário';
        
        if (error.message) {
          errorMessage = error.message;
        }
        
        toast.error(errorMessage);
        return { error };
      }

      if (data?.error) {
        console.error('Erro retornado pela função:', data.error);
        toast.error(data.error);
        return { error: data.error };
      }

      if (data?.success) {
        console.log('Usuário criado com sucesso:', data.user);
        toast.success(data.message || 'Usuário criado com sucesso!');
        return {};
      }

      console.error('Resposta inesperada:', data);
      toast.error('Resposta inesperada do servidor');
      return { error: 'Resposta inesperada do servidor' };
    } catch (error) {
      console.error('Erro inesperado ao criar usuário:', error);
      toast.error('Erro inesperado ao criar usuário');
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setIsAdmin(false);
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao fazer logout');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      isAdmin,
      signIn,
      signOut,
      checkUserRole,
      createUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
