-- Add last_seen column for online status tracking
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Add status column to messages for delivery tracking (sent, delivered, read)
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read'));

-- Create index for efficient last_seen queries
CREATE INDEX IF NOT EXISTS idx_profiles_last_seen ON public.profiles(last_seen);

-- Create RLS policy for users to delete their own matches (unmatch)
CREATE POLICY "Users can delete their own matches" 
ON public.matches 
FOR DELETE 
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Create function to update last_seen on activity
CREATE OR REPLACE FUNCTION public.update_last_seen()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles 
  SET last_seen = now() 
  WHERE user_id = auth.uid();
  RETURN NEW;
END;
$$;

-- Create function to get online users (active in last 5 minutes)
CREATE OR REPLACE FUNCTION public.is_user_online(target_user_id UUID)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = target_user_id
    AND last_seen > now() - INTERVAL '5 minutes'
  );
$$;