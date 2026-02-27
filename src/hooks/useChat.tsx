import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useEffect, useCallback, useRef } from 'react';

export interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
}

export interface TypingIndicator {
  match_id: string;
  user_id: string;
  is_typing: boolean;
  updated_at: string;
}

export const useMessages = (matchId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!matchId || !user) return;
    const channel = supabase
      .channel(`messages-${matchId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `match_id=eq.${matchId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['messages', matchId] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [matchId, user, queryClient]);

  return useQuery({
    queryKey: ['messages', matchId],
    queryFn: async () => {
      if (!matchId) return [];
      const { data, error } = await supabase.from('messages').select('*').eq('match_id', matchId).order('created_at', { ascending: true });
      if (error) throw error;
      return data as Message[];
    },
    enabled: !!matchId && !!user,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ matchId, content }: { matchId: string; content: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase.from('messages').insert({ match_id: matchId, sender_id: user.id, content }).select().single();
      if (error) throw error;

      // Check if any participant is a dummy with AI enabled, and trigger AI response
      const { data: match } = await supabase.from('matches').select('user1_id, user2_id').eq('id', matchId).single();
      if (match) {
        const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
        const { data: otherProfile } = await supabase.from('profiles').select('is_dummy, ai_enabled').eq('user_id', otherUserId).single();
        
        if (otherProfile?.is_dummy && otherProfile?.ai_enabled) {
          // Trigger AI response with a small delay for realism
          setTimeout(async () => {
            try {
              await supabase.functions.invoke('ai-chat', {
                body: { matchId, dummyUserId: otherUserId, messageContent: content },
              });
            } catch (e) {
              console.error('AI auto-response failed:', e);
            }
          }, 1500 + Math.random() * 3000);
        }
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.matchId] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (matchId: string) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('messages').update({ read_at: new Date().toISOString() }).eq('match_id', matchId).neq('sender_id', user.id).is('read_at', null);
      if (error) throw error;
    },
    onSuccess: (_, matchId) => {
      queryClient.invalidateQueries({ queryKey: ['messages', matchId] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
};

export const useTypingIndicator = (matchId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!matchId || !user) return;
    const channel = supabase.channel(`typing-${matchId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'typing_indicators', filter: `match_id=eq.${matchId}` }, () => {
      queryClient.invalidateQueries({ queryKey: ['typing', matchId] });
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [matchId, user, queryClient]);

  const { data: typingUsers } = useQuery({
    queryKey: ['typing', matchId],
    queryFn: async () => {
      if (!matchId) return [];
      const { data, error } = await supabase.from('typing_indicators').select('*').eq('match_id', matchId).eq('is_typing', true).neq('user_id', user?.id || '');
      if (error) throw error;
      return data as TypingIndicator[];
    },
    enabled: !!matchId && !!user,
    refetchInterval: 3000,
  });

  const setTyping = useCallback(async (isTyping: boolean) => {
    if (!user || !matchId) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    await supabase.from('typing_indicators').upsert({ match_id: matchId, user_id: user.id, is_typing: isTyping, updated_at: new Date().toISOString() }, { onConflict: 'match_id,user_id' });
    if (isTyping) { typingTimeoutRef.current = setTimeout(() => { setTyping(false); }, 3000); }
  }, [user, matchId]);

  const isOtherUserTyping = (typingUsers || []).some(t => t.user_id !== user?.id && new Date(t.updated_at).getTime() > Date.now() - 5000);
  return { isOtherUserTyping, setTyping };
};
