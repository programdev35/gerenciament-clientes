import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, UserPlus } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface CreateUserFormProps {
  onUserCreated: () => void;
}

const CreateUserForm = ({ onUserCreated }: CreateUserFormProps) => {
  const { createUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Validate form data
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error('Todos os campos são obrigatórios');
      setIsSubmitting(false);
      return;
    }

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      setIsSubmitting(false);
      return;
    }

    console.log('Criando usuário:', { name, email });
    
    const { error } = await createUser(email, password, name);
    
    if (!error) {
      console.log('Usuário criado com sucesso, atualizando lista...');
      // Reset form
      e.currentTarget.reset();
      // Trigger list refresh
      onUserCreated();
    } else {
      console.error('Erro ao criar usuário:', error);
    }
    
    setIsSubmitting(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Criar Novo Usuário
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome Completo</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Nome completo do usuário"
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="email@exemplo.com"
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <Label htmlFor="password">Senha Temporária</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Crie uma senha temporária"
              required
              disabled={isSubmitting}
              minLength={6}
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando Usuário...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Criar Usuário
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateUserForm;
