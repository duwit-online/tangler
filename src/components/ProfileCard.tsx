import { useState } from "react";
import { motion, PanInfo, useMotionValue, useTransform } from "framer-motion";
import { MapPin, Verified, Heart, X, ChevronLeft, ChevronRight, Map } from "lucide-react";
import { Profile } from "@/data/profiles";
import { Badge } from "@/components/ui/badge";
import LocationMap from "@/components/LocationMap";

interface ProfileCardProps {
  profile: Profile;
  onSwipe: (direction: "left" | "right") => void;
  isTop: boolean;
}

const ProfileCard = ({ profile, onSwipe, isTop }: ProfileCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const x = useMotionValue(0);
  
  const rotate = useTransform(x, [-300, 0, 300], [-18, 0, 18]);
  const likeOpacity = useTransform(x, [0, 120], [0, 1]);
  const nopeOpacity = useTransform(x, [-120, 0], [1, 0]);
  const cardScale = useTransform(x, [-300, 0, 300], [0.95, 1, 0.95]);

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
      style={{ x, rotate, scale: cardScale, zIndex: isTop ? 10 : 0 }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      initial={{ scale: isTop ? 1 : 0.92, opacity: isTop ? 1 : 0.4 }}
      animate={{ scale: isTop ? 1 : 0.92, opacity: isTop ? 1 : 0.6 }}
      exit={{ 
        x: x.get() > 0 ? 400 : -400, 
        opacity: 0,
        transition: { duration: 0.35, ease: "easeOut" }
      }}
    >
      <div className="relative w-full h-full rounded-[28px] overflow-hidden shadow-elevated">
        {/* Image or Map */}
        <div className="absolute inset-0">
          {showMap && profile.location ? (
            <LocationMap location={profile.location} className="w-full h-full" />
          ) : (
            <img
              src={profile.images[currentImageIndex]}
              alt={profile.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          )}
          {/* Cinematic gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/5" />
        </div>

        {/* Map toggle */}
        {profile.location && (
          <button
            onClick={(e) => { e.stopPropagation(); setShowMap(!showMap); }}
            className="absolute top-16 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-xl glass text-white/90 hover:bg-white/20 transition-colors"
          >
            <Map className={`w-4 h-4 ${showMap ? 'text-primary' : ''}`} />
          </button>
        )}

        {/* Image dots */}
        <div className="absolute top-4 left-4 right-4 flex gap-1.5">
          {profile.images.map((_, idx) => (
            <div
              key={idx}
              className={`h-[3px] flex-1 rounded-full transition-all duration-300 ${
                idx === currentImageIndex 
                  ? "bg-white" 
                  : "bg-white/30"
              }`}
            />
          ))}
        </div>

        {/* Nav buttons */}
        {profile.images.length > 1 && (
          <>
            <button onClick={prevImage} className="absolute left-0 top-12 bottom-32 w-1/3" />
            <button onClick={nextImage} className="absolute right-0 top-12 bottom-32 w-1/3" />
          </>
        )}

        {/* Like/Nope stamps */}
        <motion.div
          className="absolute top-24 left-6 border-[3px] border-green-400 text-green-400 font-extrabold text-2xl px-4 py-1.5 rounded-xl rotate-[-15deg] tracking-wider"
          style={{ opacity: likeOpacity }}
        >
          LIKE
        </motion.div>
        <motion.div
          className="absolute top-24 right-6 border-[3px] border-red-400 text-red-400 font-extrabold text-2xl px-4 py-1.5 rounded-xl rotate-[15deg] tracking-wider"
          style={{ opacity: nopeOpacity }}
        >
          NOPE
        </motion.div>

        {/* Profile info */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex items-end gap-2 mb-2">
            <h2 className="text-[28px] font-serif font-bold text-white leading-tight">
              {profile.name}
            </h2>
            <span className="text-xl text-white/80 font-light mb-0.5">{profile.age}</span>
            {profile.verified && (
              <Verified className="w-5 h-5 text-primary fill-primary mb-1" />
            )}
          </div>
          
          {profile.occupation && (
            <p className="text-white/80 text-sm mb-1.5">{profile.occupation}</p>
          )}
          
          <div className="flex items-center gap-1.5 text-white/60 text-xs mb-3">
            <MapPin className="w-3.5 h-3.5" />
            <span>{profile.distance} miles away</span>
          </div>

          <p className="text-white/75 text-sm mb-3 line-clamp-2 leading-relaxed">{profile.bio}</p>

          <div className="flex flex-wrap gap-1.5">
            {profile.interests.slice(0, 4).map((interest) => (
              <Badge
                key={interest}
                variant="secondary"
                className="bg-white/15 backdrop-blur-sm text-white/90 border-white/10 text-[11px] font-medium px-2.5 py-0.5"
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
