-- Allow users to delete their own swipes (for undo functionality)
CREATE POLICY "Users can delete their own swipes"
  ON public.swipes
  FOR DELETE
  USING (auth.uid() = swiper_id);

-- Create notifications table for the notification system
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL, -- 'match', 'message', 'like', 'superlike'
  title TEXT NOT NULL,
  body TEXT,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
  ON public.notifications
  FOR DELETE
  USING (auth.uid() = user_id);

-- System can insert notifications (service role only or via trigger)
-- For now, we'll allow the match trigger to create notifications
CREATE OR REPLACE FUNCTION public.create_match_notifications()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify user1
  INSERT INTO public.notifications (user_id, type, title, body, data)
  VALUES (
    NEW.user1_id,
    'match',
    'New Match! 🎉',
    'You have a new match! Start chatting now.',
    jsonb_build_object('match_id', NEW.id, 'other_user_id', NEW.user2_id)
  );
  
  -- Notify user2
  INSERT INTO public.notifications (user_id, type, title, body, data)
  VALUES (
    NEW.user2_id,
    'match',
    'New Match! 🎉',
    'You have a new match! Start chatting now.',
    jsonb_build_object('match_id', NEW.id, 'other_user_id', NEW.user1_id)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create notifications on new match
CREATE TRIGGER on_match_create_notifications
  AFTER INSERT ON public.matches
  FOR EACH ROW
  EXECUTE FUNCTION public.create_match_notifications();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;