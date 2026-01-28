import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Star, MapPin, User, ChevronLeft, ChevronRight, XCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LikeProfile } from "@/hooks/useLikes";

interface LikeProfileModalProps {
  profile: LikeProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onLikeBack: (profile: LikeProfile) => void;
  onPass: (profile: LikeProfile) => void;
  showActions?: boolean;
}

const LikeProfileModal = ({
  profile,
  isOpen,
  onClose,
  onLikeBack,
  onPass,
  showActions = true,
}: LikeProfileModalProps) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  if (!profile) return null;

  const nextPhoto = () => {
    if (currentPhotoIndex < profile.photos.length - 1) {
      setCurrentPhotoIndex(prev => prev + 1);
    }
  };

  const prevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(prev => prev - 1);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="h-full flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
              <h2 className="font-semibold text-sm">Profile</h2>
              <div className="w-9" />
            </div>

            {/* Photo Gallery */}
            <div className="relative flex-1 max-h-[60vh]">
              {profile.photos[currentPhotoIndex] ? (
                <img
                  src={profile.photos[currentPhotoIndex]}
                  alt={profile.display_name || "Profile"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-secondary flex items-center justify-center">
                  <User className="w-20 h-20 text-muted-foreground" />
                </div>
              )}

              {/* Photo indicators */}
              {profile.photos.length > 1 && (
                <div className="absolute top-4 left-4 right-4 flex gap-1">
                  {profile.photos.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        idx === currentPhotoIndex ? "bg-card" : "bg-card/40"
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Photo navigation */}
              {profile.photos.length > 1 && (
                <>
                  <button
                    onClick={prevPhoto}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-card/20 backdrop-blur-sm text-card"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextPhoto}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-card/20 backdrop-blur-sm text-card"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Super like indicator */}
              {profile.direction === 'superlike' && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-accent/90 text-accent-foreground border-0">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Super Liked You
                  </Badge>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <h1 className="text-2xl font-serif font-bold text-foreground">
                  {profile.display_name}, {profile.age}
                </h1>
                {profile.location && (
                  <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
                    <MapPin className="w-4 h-4" />
                    {profile.location} • {profile.distance} mi away
                  </div>
                )}
              </div>

              {profile.bio && (
                <p className="text-muted-foreground">{profile.bio}</p>
              )}

              {profile.interests && profile.interests.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <Badge key={interest} variant="secondary" className="bg-primary/10 text-primary border-0">
                      {interest}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {showActions && (
              <div className="p-4 border-t border-border bg-card flex gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => onPass(profile)}
                  className="flex-1"
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  Pass
                </Button>
                <Button
                  size="lg"
                  onClick={() => onLikeBack(profile)}
                  className="flex-1 gradient-primary text-primary-foreground"
                >
                  <Heart className="w-5 h-5 mr-2 fill-current" />
                  Like Back
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LikeProfileModal;
