import { motion } from "framer-motion";
import { 
  Settings, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Camera, 
  Edit3,
  ChevronRight,
  Shield,
  Bell,
  HelpCircle,
  LogOut
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const userProfile = {
  name: "Alex",
  age: 28,
  bio: "Adventure seeker & coffee enthusiast. Looking for someone to explore the world with.",
  location: "New York, NY",
  occupation: "Product Designer",
  education: "NYU",
  images: [
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80",
    "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=400&q=80",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80",
  ],
  interests: ["Travel", "Photography", "Coffee", "Hiking", "Art", "Music"],
  verified: true,
};

const menuItems = [
  { icon: Settings, label: "Settings", color: "text-foreground" },
  { icon: Shield, label: "Privacy & Safety", color: "text-foreground" },
  { icon: Bell, label: "Notifications", color: "text-foreground" },
  { icon: HelpCircle, label: "Help & Support", color: "text-foreground" },
  { icon: LogOut, label: "Log Out", color: "text-destructive" },
];

const ProfileView = () => {
  return (
    <div className="pt-20 pb-24 px-4">
      {/* Profile header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-8"
      >
        {/* Main photo */}
        <div className="relative w-32 h-32 mx-auto mb-4">
          <img
            src={userProfile.images[0]}
            alt={userProfile.name}
            className="w-full h-full rounded-full object-cover border-4 border-card shadow-elevated"
          />
          <button className="absolute bottom-0 right-0 w-10 h-10 gradient-primary rounded-full flex items-center justify-center text-primary-foreground shadow-card">
            <Camera className="w-5 h-5" />
          </button>
        </div>

        {/* Name and verification */}
        <div className="text-center">
          <h1 className="text-2xl font-serif font-bold text-foreground">
            {userProfile.name}, {userProfile.age}
          </h1>
          <div className="flex items-center justify-center gap-4 mt-2 text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {userProfile.location}
            </span>
          </div>
        </div>

        {/* Edit profile button */}
        <Button
          variant="outline"
          className="mx-auto mt-4 flex items-center gap-2"
        >
          <Edit3 className="w-4 h-4" />
          Edit Profile
        </Button>
      </motion.div>

      {/* Profile completion */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl p-4 shadow-card mb-6"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-foreground">Profile Completion</h2>
          <span className="text-primary font-semibold">85%</span>
        </div>
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "85%" }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="h-full gradient-primary rounded-full"
          />
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Add more photos to complete your profile
        </p>
      </motion.div>

      {/* Photo grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <h2 className="font-semibold text-foreground mb-3">Your Photos</h2>
        <div className="grid grid-cols-3 gap-2">
          {userProfile.images.map((image, index) => (
            <div
              key={index}
              className="aspect-square rounded-xl overflow-hidden relative group"
            >
              <img
                src={image}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Edit3 className="w-6 h-6 text-card" />
              </div>
            </div>
          ))}
          {/* Add photo button */}
          <button className="aspect-square rounded-xl border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors">
            <Camera className="w-8 h-8" />
          </button>
        </div>
      </motion.div>

      {/* Bio */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card rounded-2xl p-4 shadow-card mb-6"
      >
        <h2 className="font-semibold text-foreground mb-2">About Me</h2>
        <p className="text-muted-foreground">{userProfile.bio}</p>
        
        <div className="flex flex-wrap gap-2 mt-4">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Briefcase className="w-4 h-4" />
            {userProfile.occupation}
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <GraduationCap className="w-4 h-4" />
            {userProfile.education}
          </div>
        </div>
      </motion.div>

      {/* Interests */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-6"
      >
        <h2 className="font-semibold text-foreground mb-3">Interests</h2>
        <div className="flex flex-wrap gap-2">
          {userProfile.interests.map((interest) => (
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

      {/* Menu items */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-card rounded-2xl overflow-hidden shadow-card"
      >
        {menuItems.map((item, index) => (
          <button
            key={item.label}
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
