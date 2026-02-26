import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const result = authSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === 'email') fieldErrors.email = err.message;
        if (err.path[0] === 'password') fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      const { error } = isLogin 
        ? await signIn(email, password)
        : await signUp(email, password);

      if (error) {
        toast.error(error.message);
      } else {
        if (!isLogin) {
          toast.success('Account created! Complete your profile to start matching.');
        }
        navigate('/');
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 right-0 h-[45vh] gradient-primary opacity-[0.06] rounded-b-[60px]" />
      <div className="absolute top-10 right-[-30px] w-40 h-40 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-20 left-[-20px] w-32 h-32 rounded-full bg-accent/5 blur-3xl" />

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="w-20 h-20 gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-glow rotate-6">
            <Heart className="w-10 h-10 text-primary-foreground fill-primary-foreground -rotate-6" />
          </div>
          <h1 className="text-4xl font-serif font-bold text-foreground mb-1 tracking-tight">
            Plurr
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            Connect Now
          </p>
        </motion.div>

        {/* Auth card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <div className="bg-card rounded-3xl p-6 shadow-elevated border border-border/50">
            {/* Tabs */}
            <div className="flex bg-secondary/60 rounded-2xl p-1 mb-6">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isLogin 
                    ? 'bg-card text-foreground shadow-card' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  !isLogin 
                    ? 'bg-card text-foreground shadow-card' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`pl-10 h-12 rounded-xl bg-secondary/50 border-border/50 text-sm focus:bg-card transition-colors ${
                      errors.email ? 'ring-2 ring-destructive' : ''
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-destructive font-medium">{errors.email}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`pl-10 pr-10 h-12 rounded-xl bg-secondary/50 border-border/50 text-sm focus:bg-card transition-colors ${
                      errors.password ? 'ring-2 ring-destructive' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive font-medium">{errors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm shadow-glow hover:opacity-90 transition-opacity group"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            {isLogin && (
              <button className="w-full text-center text-xs text-primary font-medium mt-4 hover:underline">
                Forgot password?
              </button>
            )}
          </div>

          {/* Terms */}
          <p className="text-center text-[11px] text-muted-foreground mt-5 px-6 leading-relaxed">
            By continuing, you agree to our{' '}
            <a href="/terms" className="text-primary hover:underline">Terms</a> and{' '}
            <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
