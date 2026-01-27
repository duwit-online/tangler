import { motion } from "framer-motion";
import { Settings, Bell, Palette } from "lucide-react";
import { useUnreadNotificationCount } from "@/hooks/useNotifications";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import ThemeSettings from "@/components/settings/ThemeSettings";

interface HeaderProps {
  onNotificationClick?: () => void;
}

const Header = ({ onNotificationClick }: HeaderProps) => {
  const unreadCount = useUnreadNotificationCount();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-lg border-b border-border safe-area-top">
      <div className="flex items-center justify-between h-14 max-w-md mx-auto px-3">
        <Sheet open={showSettings} onOpenChange={setShowSettings}>
          <SheetTrigger asChild>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80 transition-colors"
            >
              <Palette className="w-4 h-4" />
            </motion.button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[350px]">
            <SheetHeader>
              <SheetTitle>Appearance</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <ThemeSettings />
            </div>
          </SheetContent>
        </Sheet>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1.5"
        >
          <div className="w-7 h-7 gradient-primary rounded-lg flex items-center justify-center">
            <svg 
              className="w-4 h-4 text-primary-foreground" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
              />
            </svg>
          </div>
          <h1 className="text-lg font-serif font-bold text-gradient">
            tangle
          </h1>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNotificationClick}
          className="relative w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80 transition-colors"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </motion.button>
      </div>
    </header>
  );
};

export default Header;