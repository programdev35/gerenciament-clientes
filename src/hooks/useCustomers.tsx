
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Customer {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  reference_point?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerFormData {
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
}

export const useCustomers = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Buscar clientes
  const {
    data: customers = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['customers', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Customer[];
    },
    enabled: !!user,
  });

  // Criar cliente
  const createCustomer = useMutation({
    mutationFn: async (customerData: CustomerFormData) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('customers')
        .insert({
          user_id: user.id,
          name: customerData.name,
          phone: customerData.phone.replace(/\D/g, ''),
          street: customerData.street,
          number: customerData.number,
          complement: customerData.complement || null,
          neighborhood: customerData.neighborhood,
          city: customerData.city,
          state: customerData.state,
          zip_code: customerData.zipCode.replace(/\D/g, ''),
          reference_point: customerData.referencePoint || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Cliente cadastrado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao criar cliente:', error);
      toast.error('Erro ao cadastrar cliente. Tente novamente.');
    },
  });

  // Atualizar cliente
  const updateCustomer = useMutation({
    mutationFn: async ({ id, customerData }: { id: string; customerData: CustomerFormData }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('customers')
        .update({
          name: customerData.name,
          phone: customerData.phone.replace(/\D/g, ''),
          street: customerData.street,
          number: customerData.number,
          complement: customerData.complement || null,
          neighborhood: customerData.neighborhood,
          city: customerData.city,
          state: customerData.state,
          zip_code: customerData.zipCode.replace(/\D/g, ''),
          reference_point: customerData.referencePoint || null,
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Cliente atualizado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar cliente:', error);
      toast.error('Erro ao atualizar cliente. Tente novamente.');
    },
  });

  // Deletar cliente
  const deleteCustomer = useMutation({
    mutationFn: async (customerId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Cliente excluído com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao excluir cliente:', error);
      toast.error('Erro ao excluir cliente. Tente novamente.');
    },
  });

  return {
    customers,
    isLoading,
    error,
    createCustomer: createCustomer.mutate,
    updateCustomer: updateCustomer.mutate,
    deleteCustomer: deleteCustomer.mutate,
    isCreating: createCustomer.isPending,
    isUpdating: updateCustomer.isPending,
    isDeleting: deleteCustomer.isPending,
  };
};
