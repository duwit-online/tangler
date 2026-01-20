import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, X } from "lucide-react";
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal content */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-sm"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-card/20 backdrop-blur-sm flex items-center justify-center text-card hover:bg-card/40 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Card */}
            <div className="bg-card rounded-3xl overflow-hidden shadow-elevated">
              {/* Header with gradient */}
              <div className="gradient-primary p-8 text-center relative overflow-hidden">
                {/* Floating hearts animation */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute"
                      initial={{ 
                        y: 100, 
                        x: (i - 3) * 30,
                        opacity: 0,
                        scale: 0.5
                      }}
                      animate={{ 
                        y: -100, 
                        opacity: [0, 1, 0],
                        scale: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.3,
                        ease: "easeOut"
                      }}
                    >
                      <Heart className="w-6 h-6 text-primary-foreground/50 fill-primary-foreground/50" />
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
                  className="relative z-10"
                >
                  <h2 className="text-4xl font-serif font-bold text-primary-foreground mb-2">
                    It's a Match!
                  </h2>
                  <p className="text-primary-foreground/90">
                    You and {profile.name} liked each other
                  </p>
                </motion.div>
              </div>

              {/* Profile images */}
              <div className="flex justify-center -mt-8 relative z-10 gap-4 px-8">
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="w-24 h-24 rounded-full border-4 border-card overflow-hidden shadow-card"
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
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center animate-heart-beat">
                    <Heart className="w-5 h-5 text-primary-foreground fill-primary-foreground" />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="w-24 h-24 rounded-full border-4 border-card overflow-hidden shadow-card"
                >
                  <img
                    src={profile.images[0]}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </div>

              {/* Actions */}
              <div className="p-8 space-y-3">
                <Button
                  onClick={onMessage}
                  className="w-full h-14 text-lg gradient-primary hover:opacity-90 transition-opacity"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Send a Message
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="w-full h-12"
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
