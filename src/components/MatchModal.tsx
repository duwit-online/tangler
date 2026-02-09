import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, X, Sparkles } from "lucide-react";
import { Profile } from "@/data/profiles";
import { Button } from "@/components/ui/button";

interface MatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile | null;
  onMessage: () => void;
}

const MatchModal = ({ isOpen, onClose, profile, onMessage }: MatchModalProps) => {
  if (!profile) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 22, stiffness: 260 }}
            className="relative z-10 w-full max-w-sm"
          >
            <button
              onClick={onClose}
              className="absolute -top-12 right-0 w-10 h-10 rounded-xl glass flex items-center justify-center text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="bg-card rounded-[28px] overflow-hidden shadow-elevated border border-border/50">
              {/* Header */}
              <div className="gradient-primary p-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
                
                {/* Particles */}
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    initial={{ 
                      y: 120, 
                      x: (i - 4) * 25 + 50 + '%',
                      opacity: 0,
                      scale: 0.3
                    }}
                    animate={{ 
                      y: -80, 
                      opacity: [0, 0.8, 0],
                      scale: [0.3, 0.8, 0.3],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      delay: i * 0.25,
                      ease: "easeOut"
                    }}
                    style={{ left: `${(i / 8) * 100}%` }}
                  >
                    {i % 2 === 0 ? (
                      <Heart className="w-4 h-4 text-white/40 fill-white/40" />
                    ) : (
                      <Sparkles className="w-3 h-3 text-white/30" />
                    )}
                  </motion.div>
                ))}

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 350 }}
                  className="relative z-10"
                >
                  <h2 className="text-3xl font-serif font-bold text-primary-foreground mb-1">
                    It's a Match!
                  </h2>
                  <p className="text-primary-foreground/80 text-sm">
                    You and {profile.name} liked each other
                  </p>
                </motion.div>
              </div>

              {/* Avatars */}
              <div className="flex justify-center -mt-10 relative z-10 gap-6 px-8">
                <motion.div
                  initial={{ x: -40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="w-20 h-20 rounded-2xl border-4 border-card overflow-hidden shadow-elevated rotate-[-6deg]"
                >
                  <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80"
                    alt="You"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
                >
                  <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center animate-heart-beat shadow-glow">
                    <Heart className="w-5 h-5 text-primary-foreground fill-primary-foreground" />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ x: 40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="w-20 h-20 rounded-2xl border-4 border-card overflow-hidden shadow-elevated rotate-[6deg]"
                >
                  <img
                    src={profile.images[0]}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </div>

              {/* Actions */}
              <div className="p-6 pt-8 space-y-3">
                <Button
                  onClick={onMessage}
                  className="w-full h-13 text-base gradient-primary hover:opacity-90 transition-opacity rounded-xl font-semibold"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Send a Message
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="w-full h-12 rounded-xl border-border/50"
                >
                  Keep Swiping
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MatchModal;
