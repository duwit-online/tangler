import { useState, useRef } from "react";
import { motion, PanInfo, useMotionValue, useTransform } from "framer-motion";
import { MapPin, Verified, Heart, X, Map } from "lucide-react";
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
  const [isDragging, setIsDragging] = useState(false);
  const x = useMotionValue(0);
  const constraintsRef = useRef(null);
  
  const rotate = useTransform(x, [-300, 0, 300], [-18, 0, 18]);
  const likeOpacity = useTransform(x, [0, 80], [0, 1]);
  const nopeOpacity = useTransform(x, [-80, 0], [1, 0]);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    setIsDragging(false);
    const threshold = 80;
    const velocity = Math.abs(info.velocity.x);
    
    if (Math.abs(info.offset.x) > threshold || velocity > 500) {
      const direction = info.offset.x > 0 ? "right" : "left";
      onSwipe(direction);
    }
  };

  const handleTap = (e: React.MouseEvent) => {
    if (isDragging) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const tapX = e.clientX - rect.left;
    const width = rect.width;
    
    if (tapX < width * 0.35 && currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    } else if (tapX > width * 0.65 && currentImageIndex < profile.images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    }
  };

  return (
    <motion.div
      ref={constraintsRef}
      className="absolute w-full h-full"
      style={{ 
        x, 
        rotate, 
        zIndex: isTop ? 10 : 0,
        touchAction: isTop ? "none" : "auto",
      }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.7}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      initial={{ scale: isTop ? 1 : 0.92, opacity: isTop ? 1 : 0.4 }}
      animate={{ scale: isTop ? 1 : 0.92, opacity: isTop ? 1 : 0.6 }}
      exit={{ 
        x: x.get() > 0 ? 400 : -400, 
        opacity: 0,
        transition: { duration: 0.35, ease: "easeOut" }
      }}
      whileDrag={{ cursor: "grabbing" }}
    >
      <div 
        className="relative w-full h-full rounded-[28px] overflow-hidden shadow-elevated cursor-grab active:cursor-grabbing"
        onClick={handleTap}
      >
        {/* Image or Map */}
        <div className="absolute inset-0">
          {showMap && profile.location ? (
            <LocationMap location={profile.location} className="w-full h-full" />
          ) : (
            <img
              src={profile.images[currentImageIndex]}
              alt={profile.name}
              className="w-full h-full object-cover select-none pointer-events-none"
              draggable={false}
              loading="lazy"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/5" />
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
        <div className="absolute top-4 left-4 right-4 flex gap-1.5 z-10">
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

        {/* Like/Nope stamps */}
        <motion.div
          className="absolute top-20 left-6 z-20 border-[4px] border-success font-extrabold text-3xl px-5 py-2 rounded-2xl rotate-[-15deg] tracking-wider"
          style={{ opacity: likeOpacity, color: "hsl(var(--success))", borderColor: "hsl(var(--success))" }}
        >
          LIKE
        </motion.div>
        <motion.div
          className="absolute top-20 right-6 z-20 border-[4px] border-destructive font-extrabold text-3xl px-5 py-2 rounded-2xl rotate-[15deg] tracking-wider"
          style={{ opacity: nopeOpacity, color: "hsl(var(--destructive))", borderColor: "hsl(var(--destructive))" }}
        >
          NOPE
        </motion.div>

        {/* Profile info */}
        <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
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
