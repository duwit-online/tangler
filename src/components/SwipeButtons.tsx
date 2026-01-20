import { motion } from "framer-motion";
import { X, Heart, Star, RotateCcw } from "lucide-react";

interface SwipeButtonsProps {
  onSwipe: (direction: "left" | "right") => void;
  onSuperLike?: () => void;
  onUndo?: () => void;
  canUndo?: boolean;
}

const SwipeButtons = ({ onSwipe, onSuperLike, onUndo, canUndo }: SwipeButtonsProps) => {
  return (
    <div className="flex items-center justify-center gap-4 py-6">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onUndo}
        disabled={!canUndo}
        className="w-12 h-12 rounded-full bg-card shadow-card flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <RotateCcw className="w-5 h-5" />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onSwipe("left")}
        className="w-16 h-16 rounded-full bg-card shadow-elevated flex items-center justify-center text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
      >
        <X className="w-8 h-8" />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onSuperLike}
        className="w-12 h-12 rounded-full bg-card shadow-card flex items-center justify-center text-accent hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        <Star className="w-5 h-5" />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onSwipe("right")}
        className="w-16 h-16 rounded-full gradient-primary shadow-glow flex items-center justify-center text-primary-foreground"
      >
        <Heart className="w-8 h-8" />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="w-12 h-12 rounded-full bg-card shadow-card flex items-center justify-center text-accent hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </motion.button>
    </div>
  );
};

export default SwipeButtons;
