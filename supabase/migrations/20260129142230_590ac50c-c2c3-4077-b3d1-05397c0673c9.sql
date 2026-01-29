-- Create app role enum for admin system
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Bank accounts table (for admin to configure payment details)
CREATE TABLE public.bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_name TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  routing_number TEXT,
  swift_code TEXT,
  currency TEXT NOT NULL DEFAULT 'USD',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

-- Everyone can view active bank accounts (to make payments)
CREATE POLICY "Anyone can view active bank accounts"
ON public.bank_accounts FOR SELECT
USING (is_active = true);

-- Only admins can manage bank accounts
CREATE POLICY "Admins can manage bank accounts"
ON public.bank_accounts FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Subscription plans table
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  duration_days INTEGER, -- NULL for lifetime
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active plans"
ON public.subscription_plans FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage plans"
ON public.subscription_plans FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- User subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.subscription_plans(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, active, expired, cancelled
  payment_reference TEXT,
  payment_proof_url TEXT,
  amount_paid DECIMAL(10,2),
  bank_account_id UUID REFERENCES public.bank_accounts(id),
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  starts_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions"
ON public.user_subscriptions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create subscriptions"
ON public.user_subscriptions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their pending subscriptions"
ON public.user_subscriptions FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can manage all subscriptions"
ON public.user_subscriptions FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- User reports table (for content moderation)
CREATE TABLE public.user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reported_user_id UUID NOT NULL,
  reported_content_type TEXT NOT NULL, -- 'profile', 'message', 'photo'
  reported_content_id TEXT,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, reviewed, resolved, dismissed
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  action_taken TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports"
ON public.user_reports FOR INSERT
WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports"
ON public.user_reports FOR SELECT
USING (auth.uid() = reporter_id);

CREATE POLICY "Admins can manage all reports"
ON public.user_reports FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- User bans table
CREATE TABLE public.user_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  banned_by UUID NOT NULL,
  banned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE, -- NULL for permanent
  is_active BOOLEAN NOT NULL DEFAULT true
);

ALTER TABLE public.user_bans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can check their own ban status"
ON public.user_bans FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage bans"
ON public.user_bans FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Function to check if user has active premium
CREATE OR REPLACE FUNCTION public.has_premium(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_subscriptions
    WHERE user_id = _user_id
      AND status = 'active'
      AND (expires_at IS NULL OR expires_at > now())
  )
$$;

-- Function to check if user is banned
CREATE OR REPLACE FUNCTION public.is_user_banned(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_bans
    WHERE user_id = _user_id
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
  )
$$;

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, description, price, duration_days, features) VALUES
('Monthly Premium', 'Full access to all premium features for 30 days', 9.99, 30, '["See who liked you", "Unlimited likes", "Read receipts", "Priority support"]'::jsonb),
('Yearly Premium', 'Full access to all premium features for 1 year', 79.99, 365, '["See who liked you", "Unlimited likes", "Read receipts", "Priority support", "2 months free"]'::jsonb),
('Lifetime Premium', 'Lifetime access to all premium features', 149.99, NULL, '["See who liked you", "Unlimited likes", "Read receipts", "Priority support", "Lifetime access"]'::jsonb);

-- Trigger to update timestamps
CREATE TRIGGER update_bank_accounts_updated_at
BEFORE UPDATE ON public.bank_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
BEFORE UPDATE ON public.user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();