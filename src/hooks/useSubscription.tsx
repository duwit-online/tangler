import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  duration_days: number | null;
  features: string[];
  is_active: boolean;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  payment_reference: string | null;
  payment_proof_url: string | null;
  amount_paid: number | null;
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
  plan?: SubscriptionPlan;
}

export interface BankAccount {
  id: string;
  account_name: string;
  bank_name: string;
  account_number: string;
  routing_number: string | null;
  swift_code: string | null;
  currency: string;
  is_active: boolean;
}

export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });
      
      if (error) throw error;
      return data as SubscriptionPlan[];
    },
  });
};

export const useBankAccounts = () => {
  return useQuery({
    queryKey: ['bank-accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      return data as BankAccount[];
    },
  });
};

export const useUserSubscription = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-subscription', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data as UserSubscription | null;
    },
    enabled: !!user,
  });
};

export const useHasPremium = () => {
  const { data: subscription } = useUserSubscription();
  
  if (!subscription) return false;
  if (subscription.status !== 'active') return false;
  if (subscription.expires_at && new Date(subscription.expires_at) < new Date()) return false;
  
  return true;
};

export const useCreateSubscription = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({
      planId,
      paymentReference,
      paymentProofUrl,
      bankAccountId,
    }: {
      planId: string;
      paymentReference: string;
      paymentProofUrl?: string;
      bankAccountId: string;
    }) => {
      if (!user) throw new Error('Must be logged in');
      
      // Get plan details
      const { data: plan } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single();
      
      if (!plan) throw new Error('Plan not found');
      
      const { data, error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          plan_id: planId,
          payment_reference: paymentReference,
          payment_proof_url: paymentProofUrl,
          bank_account_id: bankAccountId,
          amount_paid: plan.price,
          status: 'pending',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
      toast.success('Payment submitted! We\'ll verify within 24 hours.');
    },
    onError: (error) => {
      toast.error('Failed to submit payment: ' + error.message);
    },
  });
};

export const useUploadPaymentProof = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `payment-proofs/${fileName}`;
      
      const { error } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file);
      
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);
      
      return publicUrl;
    },
  });
};
