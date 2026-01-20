import { useState } from "react";
import { motion, PanInfo, useMotionValue, useTransform } from "framer-motion";
import { MapPin, Verified, Heart, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Profile } from "@/data/profiles";
import { Badge } from "@/components/ui/badge";

interface ProfileCardProps {
  profile: Profile;
  onSwipe: (direction: "left" | "right") => void;
  isTop: boolean;
}

const ProfileCard = ({ profile, onSwipe, isTop }: ProfileCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const x = useMotionValue(0);
  
  const rotate = useTransform(x, [-300, 0, 300], [-25, 0, 25]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 100) {
      onSwipe(info.offset.x > 0 ? "right" : "left");
    }
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev < profile.images.length - 1 ? prev + 1 : prev
    );
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  return (
    <motion.div
      className="absolute w-full h-full cursor-grab active:cursor-grabbing"
      style={{ x, rotate, zIndex: isTop ? 10 : 0 }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      initial={{ scale: isTop ? 1 : 0.95, opacity: isTop ? 1 : 0.5 }}
      animate={{ scale: isTop ? 1 : 0.95, opacity: isTop ? 1 : 0.7 }}
      exit={{ 
        x: x.get() > 0 ? 300 : -300, 
        opacity: 0,
        transition: { duration: 0.3 }
      }}
    >
      <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-elevated gradient-card">
        {/* Image */}
        <div className="absolute inset-0">
          <img
            src={profile.images[currentImageIndex]}
            alt={profile.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent" />
        </div>

        {/* Image navigation indicators */}
        <div className="absolute top-4 left-4 right-4 flex gap-1">
          {profile.images.map((_, idx) => (
            <div
              key={idx}
              className={`h-1 flex-1 rounded-full transition-colors ${
                idx === currentImageIndex ? "bg-card" : "bg-card/40"
              }`}
            />
          ))}
        </div>

        {/* Image navigation buttons */}
        {profile.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-card/20 backdrop-blur-sm text-card hover:bg-card/40 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-card/20 backdrop-blur-sm text-card hover:bg-card/40 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Like/Nope indicators */}
        <motion.div
          className="absolute top-20 left-6 border-4 border-primary text-primary font-bold text-3xl px-4 py-2 rounded-lg rotate-[-20deg]"
          style={{ opacity: likeOpacity }}
        >
          LIKE
        </motion.div>
        <motion.div
          className="absolute top-20 right-6 border-4 border-destructive text-destructive font-bold text-3xl px-4 py-2 rounded-lg rotate-[20deg]"
          style={{ opacity: nopeOpacity }}
        >
          NOPE
        </motion.div>

        {/* Profile info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-card">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-3xl font-serif font-semibold">
              {profile.name}, {profile.age}
            </h2>
            {profile.verified && (
              <Verified className="w-6 h-6 text-primary fill-primary" />
            )}
          </div>
          
          {profile.occupation && (
            <p className="text-card/90 text-lg mb-2">{profile.occupation}</p>
          )}
          
          <div className="flex items-center gap-1 text-card/80 mb-3">
            <MapPin className="w-4 h-4" />
            <span>{profile.distance} miles away</span>
          </div>

          <p className="text-card/90 mb-4 line-clamp-2">{profile.bio}</p>

          <div className="flex flex-wrap gap-2">
            {profile.interests.slice(0, 4).map((interest) => (
              <Badge
                key={interest}
                variant="secondary"
                className="bg-card/20 backdrop-blur-sm text-card border-card/30"
              >
                {interest}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileCard;
