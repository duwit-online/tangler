import { motion } from "framer-motion";
import { X, Heart, Star, RotateCcw, Zap } from "lucide-react";

interface SwipeButtonsProps {
  onSwipe: (direction: "left" | "right") => void;
  onSuperLike?: () => void;
  onUndo?: () => void;
  canUndo?: boolean;
}

const SwipeButtons = ({ onSwipe, onSuperLike, onUndo, canUndo }: SwipeButtonsProps) => {
  return (
    <div className="flex items-center justify-center gap-4 py-4 px-6">
      {/* Undo */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.88 }}
        onClick={onUndo}
        disabled={!canUndo}
        className="w-11 h-11 rounded-2xl bg-card shadow-card flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <RotateCcw className="w-[18px] h-[18px]" />
      </motion.button>

      {/* Nope */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.88 }}
        onClick={() => onSwipe("left")}
        className="w-[60px] h-[60px] rounded-2xl bg-card shadow-elevated flex items-center justify-center text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all duration-200"
      >
        <X className="w-7 h-7" strokeWidth={2.5} />
      </motion.button>

      {/* Super Like */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.88 }}
        onClick={onSuperLike}
        className="w-11 h-11 rounded-2xl bg-card shadow-card flex items-center justify-center text-accent hover:bg-accent hover:text-accent-foreground transition-all"
      >
        <Star className="w-[18px] h-[18px]" />
      </motion.button>

      {/* Like */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.88 }}
        onClick={() => onSwipe("right")}
        className="w-[60px] h-[60px] rounded-2xl gradient-primary shadow-glow flex items-center justify-center text-primary-foreground transition-all duration-200"
      >
        <Heart className="w-7 h-7" fill="currentColor" />
      </motion.button>

      {/* Boost */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.88 }}
        className="w-11 h-11 rounded-2xl bg-card shadow-card flex items-center justify-center text-accent hover:bg-accent hover:text-accent-foreground transition-all"
      >
        <Zap className="w-[18px] h-[18px]" />
      </motion.button>
    </div>
  );
};

export default SwipeButtons;
