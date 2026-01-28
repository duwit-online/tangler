import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, 
  Bell, 
  Shield, 
  HelpCircle, 
  FileText, 
  Mail, 
  Globe, 
  Lock,
  UserX,
  Eye,
  Smartphone,
  CreditCard,
  Star,
  Info,
  ExternalLink
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import NotificationSettings from "./NotificationSettings";

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SettingsSection = 'main' | 'notifications' | 'privacy' | 'account' | 'about';

const SettingsSheet = ({ open, onOpenChange }: SettingsSheetProps) => {
  const [currentSection, setCurrentSection] = useState<SettingsSection>('main');
  const [discoveryEnabled, setDiscoveryEnabled] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [showDistance, setShowDistance] = useState(true);
  const [showAge, setShowAge] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);

  const renderMainMenu = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Account Section */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
          Account
        </h3>
        <div className="bg-card rounded-xl overflow-hidden shadow-card">
          <SettingsItem
            icon={Bell}
            label="Notifications"
            onClick={() => setCurrentSection('notifications')}
          />
          <SettingsItem
            icon={Shield}
            label="Privacy & Safety"
            onClick={() => setCurrentSection('privacy')}
          />
          <SettingsItem
            icon={Lock}
            label="Account Settings"
            onClick={() => setCurrentSection('account')}
          />
          <SettingsItem
            icon={CreditCard}
            label="Subscription"
            subtitle="Free Plan"
          />
        </div>
      </div>

      {/* Discovery Section */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
          Discovery
        </h3>
        <div className="bg-card rounded-xl overflow-hidden shadow-card">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm">Show me on Tangle</span>
            </div>
            <Switch 
              checked={discoveryEnabled} 
              onCheckedChange={setDiscoveryEnabled}
            />
          </div>
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm">Show Online Status</span>
            </div>
            <Switch 
              checked={showOnlineStatus} 
              onCheckedChange={setShowOnlineStatus}
            />
          </div>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm">Read Receipts</span>
            </div>
            <Switch 
              checked={readReceipts} 
              onCheckedChange={setReadReceipts}
            />
          </div>
        </div>
      </div>

      {/* Support Section */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
          Support
        </h3>
        <div className="bg-card rounded-xl overflow-hidden shadow-card">
          <SettingsItem
            icon={HelpCircle}
            label="Help & Support"
            external
          />
          <SettingsItem
            icon={Mail}
            label="Contact Us"
            external
          />
          <SettingsItem
            icon={Star}
            label="Rate the App"
            external
          />
        </div>
      </div>

      {/* Legal Section */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
          Legal
        </h3>
        <div className="bg-card rounded-xl overflow-hidden shadow-card">
          <SettingsItem icon={FileText} label="Terms of Service" external />
          <SettingsItem icon={Shield} label="Privacy Policy" external />
          <SettingsItem icon={FileText} label="Cookie Policy" external />
          <SettingsItem icon={FileText} label="Community Guidelines" external />
        </div>
      </div>

      {/* About */}
      <div className="text-center pt-4 pb-8">
        <p className="text-xs text-muted-foreground">Tangle v1.0.0</p>
        <p className="text-xs text-muted-foreground mt-1">Made with ❤️</p>
      </div>
    </motion.div>
  );

  const renderNotificationsSection = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <button
        onClick={() => setCurrentSection('main')}
        className="flex items-center gap-1 text-primary text-sm mb-4"
      >
        <ChevronRight className="w-4 h-4 rotate-180" />
        Back
      </button>
      <NotificationSettings />
    </motion.div>
  );

  const renderPrivacySection = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <button
        onClick={() => setCurrentSection('main')}
        className="flex items-center gap-1 text-primary text-sm mb-4"
      >
        <ChevronRight className="w-4 h-4 rotate-180" />
        Back
      </button>

      <div className="bg-card rounded-xl overflow-hidden shadow-card">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <span className="text-sm font-medium block">Show Distance</span>
            <span className="text-xs text-muted-foreground">Others can see how far you are</span>
          </div>
          <Switch 
            checked={showDistance} 
            onCheckedChange={setShowDistance}
          />
        </div>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <span className="text-sm font-medium block">Show Age</span>
            <span className="text-xs text-muted-foreground">Display your age on profile</span>
          </div>
          <Switch 
            checked={showAge} 
            onCheckedChange={setShowAge}
          />
        </div>
        <div className="flex items-center justify-between p-4">
          <div>
            <span className="text-sm font-medium block">Show Online Status</span>
            <span className="text-xs text-muted-foreground">Let others see when you're active</span>
          </div>
          <Switch 
            checked={showOnlineStatus} 
            onCheckedChange={setShowOnlineStatus}
          />
        </div>
      </div>

      <div className="bg-card rounded-xl overflow-hidden shadow-card">
        <SettingsItem
          icon={UserX}
          label="Blocked Users"
          subtitle="0 blocked"
        />
        <SettingsItem
          icon={Eye}
          label="Hidden Profiles"
          subtitle="0 hidden"
        />
      </div>
    </motion.div>
  );

  const renderAccountSection = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <button
        onClick={() => setCurrentSection('main')}
        className="flex items-center gap-1 text-primary text-sm mb-4"
      >
        <ChevronRight className="w-4 h-4 rotate-180" />
        Back
      </button>

      <div className="bg-card rounded-xl overflow-hidden shadow-card">
        <SettingsItem
          icon={Mail}
          label="Email"
          subtitle="user@example.com"
        />
        <SettingsItem
          icon={Lock}
          label="Change Password"
        />
        <SettingsItem
          icon={Smartphone}
          label="Phone Number"
          subtitle="Not set"
        />
      </div>

      <div className="bg-card rounded-xl overflow-hidden shadow-card">
        <div className="p-4">
          <p className="text-sm font-medium mb-1">Pause Account</p>
          <p className="text-xs text-muted-foreground mb-3">
            Temporarily hide your profile. You can reactivate anytime.
          </p>
          <Button variant="outline" size="sm" className="w-full">
            Pause My Account
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl overflow-hidden shadow-card">
        <div className="p-4">
          <p className="text-sm font-medium text-destructive mb-1">Delete Account</p>
          <p className="text-xs text-muted-foreground mb-3">
            Permanently delete your account and all data. This cannot be undone.
          </p>
          <Button variant="destructive" size="sm" className="w-full">
            Delete My Account
          </Button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-lg font-serif">Settings</SheetTitle>
        </SheetHeader>
        
        <AnimatePresence mode="wait">
          {currentSection === 'main' && renderMainMenu()}
          {currentSection === 'notifications' && renderNotificationsSection()}
          {currentSection === 'privacy' && renderPrivacySection()}
          {currentSection === 'account' && renderAccountSection()}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
};

interface SettingsItemProps {
  icon: React.ElementType;
  label: string;
  subtitle?: string;
  onClick?: () => void;
  external?: boolean;
}

const SettingsItem = ({ icon: Icon, label, subtitle, onClick, external }: SettingsItemProps) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors border-b border-border last:border-0"
  >
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5 text-muted-foreground" />
      <div className="text-left">
        <span className="text-sm block">{label}</span>
        {subtitle && (
          <span className="text-xs text-muted-foreground">{subtitle}</span>
        )}
      </div>
    </div>
    {external ? (
      <ExternalLink className="w-4 h-4 text-muted-foreground" />
    ) : (
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    )}
  </button>
);

export default SettingsSheet;
