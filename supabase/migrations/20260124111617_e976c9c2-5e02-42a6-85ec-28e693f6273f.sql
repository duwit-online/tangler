-- Add unique constraint on typing_indicators for (match_id, user_id)
CREATE UNIQUE INDEX IF NOT EXISTS typing_indicators_match_user_unique 
ON public.typing_indicators (match_id, user_id);

-- Add latitude/longitude columns to profiles for real geolocation
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Create index for geolocation queries
CREATE INDEX IF NOT EXISTS profiles_location_idx ON public.profiles (latitude, longitude)
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;