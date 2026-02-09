import { motion } from "framer-motion";
import { Flame, MessageCircle, Heart, User, Compass, Crown } from "lucide-react";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "discover", icon: Flame, label: "Discover" },
  { id: "explore", icon: Compass, label: "Explore" },
  { id: "likes", icon: Crown, label: "Likes" },
  { id: "matches", icon: Heart, label: "Matches" },
  { id: "messages", icon: MessageCircle, label: "Chat" },
  { id: "profile", icon: User, label: "Profile" },
];

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-strong border-t border-border/50 safe-area-bottom z-40">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center justify-center flex-1 h-full group"
            >
              {isActive && (
                <motion.div
                  layoutId="navIndicator"
                  className="absolute -top-[1px] left-3 right-3 h-[2px] rounded-full gradient-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <motion.div
                whileTap={{ scale: 0.85 }}
                className="relative"
              >
                {isActive && (
                  <motion.div
                    layoutId="navGlow"
                    className="absolute inset-0 -m-2 rounded-xl bg-primary/8"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <tab.icon
                  className={`w-5 h-5 relative z-10 transition-colors duration-200 ${
                    isActive 
                      ? "text-primary" 
                      : "text-muted-foreground group-hover:text-foreground"
                  }`}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
              </motion.div>
              <span
                className={`text-[10px] mt-1 transition-all duration-200 ${
                  isActive 
                    ? "text-primary font-semibold" 
                    : "text-muted-foreground font-medium"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
