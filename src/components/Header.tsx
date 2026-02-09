import { motion } from "framer-motion";
import { Bell, Palette } from "lucide-react";
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
    <header className="fixed top-0 left-0 right-0 z-40 glass-strong border-b border-border/50 safe-area-top">
      <div className="flex items-center justify-between h-14 max-w-md mx-auto px-4">
        <Sheet open={showSettings} onOpenChange={setShowSettings}>
          <SheetTrigger asChild>
            <motion.button
              whileTap={{ scale: 0.92 }}
              className="w-9 h-9 rounded-xl bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <Palette className="w-[18px] h-[18px]" />
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
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 gradient-primary rounded-xl flex items-center justify-center shadow-glow">
            <svg 
              className="w-[18px] h-[18px] text-primary-foreground" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-serif font-bold text-gradient tracking-tight">
            tangle
          </h1>
        </motion.div>

        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onNotificationClick}
          className="relative w-9 h-9 rounded-xl bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <Bell className="w-[18px] h-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 gradient-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center shadow-glow">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </motion.button>
      </div>
    </header>
  );
};

export default Header;
