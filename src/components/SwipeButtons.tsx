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
    <div className="flex items-center justify-center gap-3 py-4 px-6">
      {/* Undo */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.88 }}
        onClick={onUndo}
        disabled={!canUndo}
        className="w-12 h-12 rounded-2xl bg-card shadow-card flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-border/50"
      >
        <RotateCcw className="w-5 h-5" />
      </motion.button>

      {/* Nope */}
      <motion.button
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.85 }}
        onClick={() => onSwipe("left")}
        className="w-[76px] h-[76px] rounded-full bg-destructive shadow-[0_6px_28px_hsl(var(--destructive)/0.45)] flex flex-col items-center justify-center text-destructive-foreground transition-all duration-200 border-2 border-destructive/20"
      >
        <X className="w-9 h-9" strokeWidth={3} />
        <span className="text-[11px] font-extrabold uppercase tracking-widest mt-0.5">Nope</span>
      </motion.button>

      {/* Super Like */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.88 }}
        onClick={onSuperLike}
        className="w-12 h-12 rounded-2xl bg-card shadow-card flex items-center justify-center text-accent hover:bg-accent hover:text-accent-foreground transition-all border border-border/50"
      >
        <Star className="w-5 h-5" />
      </motion.button>

      {/* Like */}
      <motion.button
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.85 }}
        onClick={() => onSwipe("right")}
        className="w-[76px] h-[76px] rounded-full gradient-primary shadow-[0_6px_28px_hsl(var(--primary)/0.5)] flex flex-col items-center justify-center text-primary-foreground transition-all duration-200 border-2 border-primary/20"
      >
        <Heart className="w-9 h-9" fill="currentColor" strokeWidth={2.5} />
        <span className="text-[11px] font-extrabold uppercase tracking-widest mt-0.5">Like</span>
      </motion.button>

      {/* Boost */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.88 }}
        className="w-12 h-12 rounded-2xl bg-card shadow-card flex items-center justify-center text-accent hover:bg-accent hover:text-accent-foreground transition-all border border-border/50"
      >
        <Zap className="w-5 h-5" />
      </motion.button>
    </div>
  );
};

export default SwipeButtons;
