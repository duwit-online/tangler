
-- Add is_dummy and ai_enabled columns to profiles for dummy user support
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_dummy boolean NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ai_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ai_personality text;

-- Allow admins to insert profiles (for dummy users)
CREATE POLICY "Admins can manage all profiles"
ON public.profiles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to manage photos for dummy users  
CREATE POLICY "Admins can manage all photos"
ON public.user_photos
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to send messages as dummy users
CREATE POLICY "Admins can send messages for dummy users"
ON public.messages
FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role)
  AND EXISTS (
    SELECT 1 FROM public.profiles WHERE user_id = sender_id AND is_dummy = true
  )
);

-- Allow admins to view all messages (for dummy user management)
CREATE POLICY "Admins can view all messages"
ON public.messages
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to create matches for dummy users
CREATE POLICY "Admins can create matches"
ON public.matches
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to create swipes for dummy users
CREATE POLICY "Admins can manage swipes"
ON public.swipes
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
