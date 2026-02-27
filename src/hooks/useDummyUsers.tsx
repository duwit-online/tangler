import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface DummyUser {
  id: string;
  user_id: string;
  display_name: string | null;
  age: number | null;
  gender: string | null;
  location: string | null;
  bio: string | null;
  interests: string[];
  looking_for: string | null;
  ai_enabled: boolean;
  ai_personality: string | null;
  is_dummy: boolean;
}

export const useDummyUsers = () => {
  return useQuery({
    queryKey: ['dummy-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_dummy', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as DummyUser[];
    },
  });
};

export const useCreateDummyUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userData: {
      display_name: string;
      age: number;
      gender: string;
      location: string;
      bio: string;
      interests: string[];
      looking_for: string;
      ai_personality: string;
      ai_enabled: boolean;
      photos?: string[];
    }) => {
      // Generate a random UUID for the dummy user
      const dummyUserId = crypto.randomUUID();
      
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          user_id: dummyUserId,
          display_name: userData.display_name,
          age: userData.age,
          gender: userData.gender,
          location: userData.location,
          bio: userData.bio,
          interests: userData.interests,
          looking_for: userData.looking_for,
          ai_personality: userData.ai_personality,
          ai_enabled: userData.ai_enabled,
          is_dummy: true,
          onboarding_completed: true,
        })
        .select()
        .single();
      
      if (error) throw error;

      // Add photos if provided
      if (userData.photos && userData.photos.length > 0) {
        for (let i = 0; i < userData.photos.length; i++) {
          await supabase.from('user_photos').insert({
            user_id: dummyUserId,
            storage_path: userData.photos[i],
            display_order: i,
            is_primary: i === 0,
          });
        }
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dummy-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Dummy user created!');
    },
    onError: (error) => {
      toast.error('Failed to create dummy user: ' + error.message);
    },
  });
};

export const useUpdateDummyUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, updates }: {
      userId: string;
      updates: Partial<{
        display_name: string;
        age: number;
        gender: string;
        location: string;
        bio: string;
        interests: string[];
        looking_for: string;
        ai_personality: string;
        ai_enabled: boolean;
      }>;
    }) => {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', userId)
        .eq('is_dummy', true);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dummy-users'] });
      toast.success('Dummy user updated!');
    },
  });
};

export const useDeleteDummyUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      // Delete photos first
      await supabase.from('user_photos').delete().eq('user_id', userId);
      // Delete swipes
      await supabase.from('swipes').delete().or(`swiper_id.eq.${userId},swiped_id.eq.${userId}`);
      // Delete profile
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId)
        .eq('is_dummy', true);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dummy-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Dummy user deleted');
    },
  });
};

export const useToggleAI = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, enabled }: { userId: string; enabled: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ ai_enabled: enabled })
        .eq('user_id', userId)
        .eq('is_dummy', true);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dummy-users'] });
      toast.success('AI status updated');
    },
  });
};

export const useTriggerAIResponse = () => {
  return useMutation({
    mutationFn: async ({ matchId, dummyUserId, messageContent }: {
      matchId: string;
      dummyUserId: string;
      messageContent?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { matchId, dummyUserId, messageContent },
      });
      
      if (error) throw error;
      return data;
    },
    onError: (error) => {
      console.error('AI response failed:', error);
    },
  });
};
