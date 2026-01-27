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
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom z-40">
      <div className="flex items-center justify-around h-14 max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center justify-center flex-1 h-full active:opacity-70 transition-opacity"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-x-3 top-0 h-0.5 gradient-primary rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <tab.icon
                  className={`w-5 h-5 ${isActive ? "fill-primary/20" : ""}`}
                />
              </motion.div>
              <span
                className={`text-[10px] mt-0.5 transition-colors ${
                  isActive ? "text-primary font-medium" : "text-muted-foreground"
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