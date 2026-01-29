import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const useIsAdmin = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['is-admin', user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      
      if (error) return false;
      return !!data;
    },
    enabled: !!user,
  });
};

export const useAdminStats = () => {
  const { data: isAdmin } = useIsAdmin();
  
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [
        { count: totalUsers },
        { count: activeUsers },
        { count: totalMatches },
        { count: pendingPayments },
        { count: pendingReports },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true })
          .gte('last_seen', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('matches').select('*', { count: 'exact', head: true }),
        supabase.from('user_subscriptions').select('*', { count: 'exact', head: true })
          .eq('status', 'pending'),
        supabase.from('user_reports').select('*', { count: 'exact', head: true })
          .eq('status', 'pending'),
      ]);
      
      return {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        totalMatches: totalMatches || 0,
        pendingPayments: pendingPayments || 0,
        pendingReports: pendingReports || 0,
      };
    },
    enabled: isAdmin === true,
  });
};

export const useAdminUsers = () => {
  const { data: isAdmin } = useIsAdmin();
  
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: isAdmin === true,
  });
};

export const usePendingPayments = () => {
  const { data: isAdmin } = useIsAdmin();
  
  return useQuery({
    queryKey: ['pending-payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: isAdmin === true,
  });
};

export const useAllPayments = () => {
  const { data: isAdmin } = useIsAdmin();
  
  return useQuery({
    queryKey: ['all-payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: isAdmin === true,
  });
};

export const useVerifyPayment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({
      subscriptionId,
      approve,
    }: {
      subscriptionId: string;
      approve: boolean;
    }) => {
      if (!user) throw new Error('Must be logged in');
      
      // Get subscription details first
      const { data: sub } = await supabase
        .from('user_subscriptions')
        .select('*, plan:subscription_plans(*)')
        .eq('id', subscriptionId)
        .single();
      
      if (!sub) throw new Error('Subscription not found');
      
      const now = new Date();
      let expiresAt = null;
      
      if (approve && sub.plan?.duration_days) {
        expiresAt = new Date(now.getTime() + sub.plan.duration_days * 24 * 60 * 60 * 1000);
      }
      
      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          status: approve ? 'active' : 'rejected',
          verified_by: user.id,
          verified_at: now.toISOString(),
          starts_at: approve ? now.toISOString() : null,
          expires_at: expiresAt?.toISOString() || null,
        })
        .eq('id', subscriptionId);
      
      if (error) throw error;
    },
    onSuccess: (_, { approve }) => {
      queryClient.invalidateQueries({ queryKey: ['pending-payments'] });
      queryClient.invalidateQueries({ queryKey: ['all-payments'] });
      toast.success(approve ? 'Payment approved!' : 'Payment rejected');
    },
    onError: (error) => {
      toast.error('Failed to process payment: ' + error.message);
    },
  });
};

export const usePendingReports = () => {
  const { data: isAdmin } = useIsAdmin();
  
  return useQuery({
    queryKey: ['pending-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_reports')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: isAdmin === true,
  });
};

export const useResolveReport = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({
      reportId,
      action,
      banUser,
      banReason,
    }: {
      reportId: string;
      action: string;
      banUser?: boolean;
      banReason?: string;
    }) => {
      if (!user) throw new Error('Must be logged in');
      
      const { data: report } = await supabase
        .from('user_reports')
        .select('*')
        .eq('id', reportId)
        .single();
      
      if (!report) throw new Error('Report not found');
      
      // Update report
      const { error } = await supabase
        .from('user_reports')
        .update({
          status: 'resolved',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          action_taken: action,
        })
        .eq('id', reportId);
      
      if (error) throw error;
      
      // Ban user if requested
      if (banUser && banReason) {
        await supabase.from('user_bans').insert({
          user_id: report.reported_user_id,
          reason: banReason,
          banned_by: user.id,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-reports'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Report resolved');
    },
  });
};

export const useBanUser = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({
      userId,
      reason,
      permanent,
      days,
    }: {
      userId: string;
      reason: string;
      permanent?: boolean;
      days?: number;
    }) => {
      if (!user) throw new Error('Must be logged in');
      
      const expiresAt = permanent ? null : 
        new Date(Date.now() + (days || 7) * 24 * 60 * 60 * 1000).toISOString();
      
      const { error } = await supabase.from('user_bans').insert({
        user_id: userId,
        reason,
        banned_by: user.id,
        expires_at: expiresAt,
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User banned');
    },
  });
};

export const useAdminBankAccounts = () => {
  const { data: isAdmin } = useIsAdmin();
  
  return useQuery({
    queryKey: ['admin-bank-accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: isAdmin === true,
  });
};

export const useManageBankAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      id,
      action,
      data,
    }: {
      id?: string;
      action: 'create' | 'update' | 'delete';
      data?: {
        account_name: string;
        bank_name: string;
        account_number: string;
        routing_number?: string;
        swift_code?: string;
        currency: string;
        is_active?: boolean;
      };
    }) => {
      if (action === 'create' && data) {
        const { error } = await supabase.from('bank_accounts').insert(data);
        if (error) throw error;
      } else if (action === 'update' && id && data) {
        const { error } = await supabase.from('bank_accounts').update(data).eq('id', id);
        if (error) throw error;
      } else if (action === 'delete' && id) {
        const { error } = await supabase.from('bank_accounts').delete().eq('id', id);
        if (error) throw error;
      }
    },
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-bank-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      toast.success(`Bank account ${action}d successfully`);
    },
  });
};
