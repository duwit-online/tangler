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

      // Delete the match
      const { error: matchError } = await supabase
        .from('matches')
        .delete()
        .eq('id', matchId);

      if (matchError) throw matchError;

      // Get the other user's ID from the match first
      const { data: matchData } = await supabase
        .from('matches')
        .select('user1_id, user2_id')
        .eq('id', matchId)
        .single();

      if (matchData) {
        const otherUserId = matchData.user1_id === user.id 
          ? matchData.user2_id 
          : matchData.user1_id;

        // Delete swipes between the two users so they can rematch
        await supabase
          .from('swipes')
          .delete()
          .or(`and(swiper_id.eq.${user.id},swiped_id.eq.${otherUserId}),and(swiper_id.eq.${otherUserId},swiped_id.eq.${user.id})`);
      }

      return matchId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['smart-discover-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['smart-match-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['who-liked-me'] });
      toast.success('Unmatched successfully');
    },
    onError: (error) => {
      console.error('Unmatch failed:', error);
      toast.error('Failed to unmatch. Please try again.');
    },
  });
};
