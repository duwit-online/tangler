import { motion } from "framer-motion";
import { Heart, MapPin, Verified } from "lucide-react";
import { DiscoverProfile } from "@/hooks/useSwipes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ProfileCarouselProps {
  profiles: DiscoverProfile[];
  title: string;
  icon?: string;
  onProfileClick: (profile: DiscoverProfile) => void;
  onLike: (profile: DiscoverProfile) => void;
}

const ProfileCarousel = ({ profiles, title, icon, onProfileClick, onLike }: ProfileCarouselProps) => {
  if (profiles.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-4">
        {icon && <span className="text-xl">{icon}</span>}
        <h3 className="font-serif text-lg font-semibold text-foreground">{title}</h3>
        <span className="text-sm text-muted-foreground">({profiles.length})</span>
      </div>

      <Carousel
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {profiles.map((profile, index) => (
            <CarouselItem key={profile.id} className="pl-2 md:pl-4 basis-[70%] md:basis-1/3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative rounded-2xl overflow-hidden shadow-card cursor-pointer group aspect-[3/4]"
                onClick={() => onProfileClick(profile)}
              >
                <img
                  src={profile.photos[0]}
                  alt={profile.display_name || "Profile"}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent" />
                
                {/* Quick like button */}
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-3 right-3 w-10 h-10 rounded-full bg-card/20 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLike(profile);
                  }}
                >
                  <Heart className="w-5 h-5" />
                </Button>

                <div className="absolute bottom-0 left-0 right-0 p-4 text-card">
                  <div className="flex items-center gap-1.5 mb-1">
                    <h4 className="font-semibold text-lg">
                      {profile.display_name}, {profile.age}
                    </h4>
                    <Verified className="w-4 h-4 text-primary fill-primary" />
                  </div>
                  
                  <div className="flex items-center gap-1 text-sm text-card/80 mb-2">
                    <MapPin className="w-3 h-3" />
                    <span>{profile.distance} mi away</span>
                  </div>

                  {profile.interests && profile.interests.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {profile.interests.slice(0, 2).map((interest) => (
                        <Badge
                          key={interest}
                          variant="secondary"
                          className="bg-card/20 backdrop-blur-sm text-card border-card/30 text-xs"
                        >
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2 hidden md:flex" />
        <CarouselNext className="right-2 hidden md:flex" />
      </Carousel>
    </div>
  );
};

export default ProfileCarousel;
