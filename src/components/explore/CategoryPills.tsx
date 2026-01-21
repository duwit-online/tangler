import { motion } from "framer-motion";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { EXPLORE_CATEGORIES } from "@/hooks/useExploreProfiles";

interface CategoryPillsProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

const CategoryPills = ({ selectedCategory, onCategoryChange }: CategoryPillsProps) => {
  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-2 px-4 pb-2">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onCategoryChange(null)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === null
              ? "gradient-primary text-primary-foreground"
              : "bg-card border border-border text-foreground hover:bg-secondary"
          }`}
        >
          <span>🔥</span>
          <span>For You</span>
        </motion.button>

        {EXPLORE_CATEGORIES.map((category) => (
          <motion.button
            key={category.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => onCategoryChange(category.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category.id
                ? "gradient-primary text-primary-foreground"
                : "bg-card border border-border text-foreground hover:bg-secondary"
            }`}
          >
            <span>{category.icon}</span>
            <span>{category.label}</span>
          </motion.button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

export default CategoryPills;
