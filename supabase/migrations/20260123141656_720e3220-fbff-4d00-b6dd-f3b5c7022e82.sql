-- Add RLS policy for users to see who liked them (premium feature simulation)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'swipes' 
    AND policyname = 'Users can view swipes on themselves'
  ) THEN
    CREATE POLICY "Users can view swipes on themselves" 
    ON public.swipes 
    FOR SELECT 
    USING (auth.uid() = swiped_id);
  END IF;
END
$$;

-- Enable realtime for swipes table (ignore error if already added)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.swipes;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END
$$;