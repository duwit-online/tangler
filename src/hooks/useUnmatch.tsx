import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const useUnmatch = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (matchId: string) => {
      if (!user) throw new Error('Not authenticated');

      // Get the match data first before deleting
      const { data: matchData, error: fetchError } = await supabase
        .from('matches')
        .select('user1_id, user2_id')
        .eq('id', matchId)
        .single();

      if (fetchError) throw fetchError;

      const otherUserId = matchData.user1_id === user.id 
        ? matchData.user2_id 
        : matchData.user1_id;

      // Delete the match
      const { error: matchError } = await supabase
        .from('matches')
        .delete()
        .eq('id', matchId);

      if (matchError) throw matchError;

      // Delete swipes between the two users so they can rematch
      await supabase
        .from('swipes')
        .delete()
        .or(`and(swiper_id.eq.${user.id},swiped_id.eq.${otherUserId}),and(swiper_id.eq.${otherUserId},swiped_id.eq.${user.id})`);

      return { matchId, otherUserId };
    },
    onSuccess: () => {
      // Invalidate all relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['discover-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['smart-discover-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['smart-match-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['who-liked-me'] });
      queryClient.invalidateQueries({ queryKey: ['explore-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['nearby-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['new-matches-week'] });
      toast.success('Unmatched successfully');
    },
    onError: (error) => {
      console.error('Unmatch failed:', error);
      toast.error('Failed to unmatch. Please try again.');
    },
  });
};
