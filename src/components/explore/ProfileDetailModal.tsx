import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, MapPin, Verified, ChevronLeft, ChevronRight, Star, Map } from "lucide-react";
import { DiscoverProfile } from "@/hooks/useSwipes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import LocationMap from "@/components/LocationMap";

interface ProfileDetailModalProps {
  profile: DiscoverProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onLike: (profile: DiscoverProfile) => void;
  onSuperLike: (profile: DiscoverProfile) => void;
}

const ProfileDetailModal = ({ profile, isOpen, onClose, onLike, onSuperLike }: ProfileDetailModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showMap, setShowMap] = useState(false);

  if (!profile) return null;

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev < profile.photos.length - 1 ? prev + 1 : prev
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background"
        >
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-card/80 backdrop-blur-sm"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-card/80 backdrop-blur-sm"
              onClick={() => setShowMap(!showMap)}
            >
              <Map className="w-5 h-5" />
            </Button>
          </div>

          <div className="h-full overflow-y-auto pb-24">
            {/* Images */}
            <div className="relative h-[60vh]">
              <img
                src={profile.photos[currentImageIndex]}
                alt={profile.display_name || "Profile"}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

              {/* Image indicators */}
              <div className="absolute top-16 left-4 right-4 flex gap-1">
                {profile.photos.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      idx === currentImageIndex ? "bg-card" : "bg-card/40"
                    }`}
                  />
                ))}
              </div>

              {/* Image navigation */}
              {profile.photos.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-card/20 backdrop-blur-sm text-card"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-card/20 backdrop-blur-sm text-card"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Profile Info */}
            <div className="px-4 -mt-16 relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-3xl font-serif font-semibold text-foreground">
                  {profile.display_name}, {profile.age}
                </h2>
                <Verified className="w-6 h-6 text-primary fill-primary" />
              </div>

              <div className="flex items-center gap-1 text-muted-foreground mb-4">
                <MapPin className="w-4 h-4" />
                <span>{profile.distance} miles away</span>
                {profile.location && <span>• {profile.location}</span>}
              </div>

              {profile.bio && (
                <p className="text-foreground mb-4">{profile.bio}</p>
              )}

              {profile.interests && profile.interests.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest) => (
                      <Badge
                        key={interest}
                        variant="secondary"
                        className="bg-secondary text-secondary-foreground"
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Map Section */}
              {showMap && profile.location && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Location</h4>
                <div className="rounded-xl overflow-hidden h-48">
                    <LocationMap location={profile.location} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
            <div className="flex items-center justify-center gap-4">
              <Button
                size="lg"
                variant="outline"
                className="w-16 h-16 rounded-full border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={onClose}
              >
                <X className="w-7 h-7" />
              </Button>
              <Button
                size="lg"
                className="w-16 h-16 rounded-full gradient-primary text-primary-foreground"
                onClick={() => {
                  onSuperLike(profile);
                  onClose();
                }}
              >
                <Star className="w-7 h-7 fill-current" />
              </Button>
              <Button
                size="lg"
                className="w-16 h-16 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => {
                  onLike(profile);
                  onClose();
                }}
              >
                <Heart className="w-7 h-7 fill-current" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProfileDetailModal;
