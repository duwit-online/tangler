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
        className="w-12 h-12 rounded-2xl bg-card shadow-card flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <RotateCcw className="w-5 h-5" />
      </motion.button>

      {/* Nope */}
      <motion.button
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.85 }}
        onClick={() => onSwipe("left")}
        className="w-[72px] h-[72px] rounded-full bg-destructive shadow-[0_4px_24px_hsl(var(--destructive)/0.4)] flex flex-col items-center justify-center text-destructive-foreground transition-all duration-200"
      >
        <X className="w-8 h-8" strokeWidth={3} />
        <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5">Nope</span>
      </motion.button>

      {/* Super Like */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.88 }}
        onClick={onSuperLike}
        className="w-12 h-12 rounded-2xl bg-card shadow-card flex items-center justify-center text-accent hover:bg-accent hover:text-accent-foreground transition-all"
      >
        <Star className="w-5 h-5" />
      </motion.button>

      {/* Like */}
      <motion.button
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.85 }}
        onClick={() => onSwipe("right")}
        className="w-[72px] h-[72px] rounded-full gradient-primary shadow-[0_4px_24px_hsl(var(--primary)/0.5)] flex flex-col items-center justify-center text-primary-foreground transition-all duration-200"
      >
        <Heart className="w-8 h-8" fill="currentColor" strokeWidth={2.5} />
        <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5">Like</span>
      </motion.button>

      {/* Boost */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.88 }}
        className="w-12 h-12 rounded-2xl bg-card shadow-card flex items-center justify-center text-accent hover:bg-accent hover:text-accent-foreground transition-all"
      >
        <Zap className="w-5 h-5" />
      </motion.button>
    </div>
  );
};

export default SwipeButtons;
