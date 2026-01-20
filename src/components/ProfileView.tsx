import { motion } from "framer-motion";
import { 
  Settings, 
  MapPin, 
  Camera, 
  Edit3,
  ChevronRight,
  Shield,
  Bell,
  HelpCircle,
  LogOut,
  Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, useUserPhotos, getPhotoUrl } from "@/hooks/useProfile";
import { useNavigate } from "react-router-dom";

const ProfileView = () => {
  const { signOut } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const { data: photos = [] } = useUserPhotos();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  const menuItems = [
    { icon: Settings, label: "Settings", color: "text-foreground", action: () => {} },
    { icon: Shield, label: "Privacy & Safety", color: "text-foreground", action: () => {} },
    { icon: Bell, label: "Notifications", color: "text-foreground", action: () => {} },
    { icon: HelpCircle, label: "Help & Support", color: "text-foreground", action: () => {} },
    { icon: LogOut, label: "Log Out", color: "text-destructive", action: handleLogout },
  ];

  if (isLoading) {
    return (
      <div className="pt-20 pb-24 px-4 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const primaryPhoto = photos.find(p => p.is_primary) || photos[0];

  return (
    <div className="pt-20 pb-24 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-8"
      >
        <div className="relative w-32 h-32 mx-auto mb-4">
          <div className="w-full h-full rounded-full overflow-hidden bg-secondary border-4 border-card shadow-elevated">
            {primaryPhoto ? (
              <img
                src={getPhotoUrl(primaryPhoto.storage_path)}
                alt={profile?.display_name || "Profile"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-4xl font-semibold">
                {(profile?.display_name || "?").charAt(0)}
              </div>
            )}
          </div>
          <button className="absolute bottom-0 right-0 w-10 h-10 gradient-primary rounded-full flex items-center justify-center text-primary-foreground shadow-card">
            <Camera className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-serif font-bold text-foreground">
            {profile?.display_name || "Unknown"}{profile?.age ? `, ${profile.age}` : ""}
          </h1>
          {profile?.location && (
            <div className="flex items-center justify-center gap-1 mt-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              {profile.location}
            </div>
          )}
        </div>

        <Button
          variant="outline"
          className="mx-auto mt-4 flex items-center gap-2"
          onClick={() => navigate("/onboarding")}
        >
          <Edit3 className="w-4 h-4" />
          Edit Profile
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl p-4 shadow-card mb-6"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-foreground">Profile Completion</h2>
          <span className="text-primary font-semibold">
            {profile?.onboarding_completed ? "100%" : "50%"}
          </span>
        </div>
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: profile?.onboarding_completed ? "100%" : "50%" }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="h-full gradient-primary rounded-full"
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <h2 className="font-semibold text-foreground mb-3">Your Photos</h2>
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="aspect-square rounded-xl overflow-hidden relative group"
            >
              <img
                src={getPhotoUrl(photo.storage_path)}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          {photos.length < 6 && (
            <button className="aspect-square rounded-xl border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors">
              <Camera className="w-8 h-8" />
            </button>
          )}
        </div>
      </motion.div>

      {profile?.bio && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl p-4 shadow-card mb-6"
        >
          <h2 className="font-semibold text-foreground mb-2">About Me</h2>
          <p className="text-muted-foreground">{profile.bio}</p>
        </motion.div>
      )}

      {profile?.interests && profile.interests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <h2 className="font-semibold text-foreground mb-3">Interests</h2>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest) => (
              <Badge
                key={interest}
                variant="secondary"
                className="px-3 py-1.5 text-sm bg-primary/10 text-primary border-0"
              >
                {interest}
              </Badge>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-card rounded-2xl overflow-hidden shadow-card"
      >
        {menuItems.map((item, index) => (
          <button
            key={item.label}
            onClick={item.action}
            className={`w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors ${
              index !== menuItems.length - 1 ? "border-b border-border" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon className={`w-5 h-5 ${item.color}`} />
              <span className={item.color}>{item.label}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        ))}
      </motion.div>
    </div>
  );
};

export default ProfileView;
