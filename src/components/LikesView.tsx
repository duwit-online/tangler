import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Star, Crown, Loader2, Sparkles, Check, X, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useWhoLikedMe, useWhoILiked, useLikeBack, LikeProfile } from "@/hooks/useLikes";
import { useSwipe } from "@/hooks/useSwipes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import LikeProfileModal from "@/components/likes/LikeProfileModal";

interface LikesViewProps {
  onOpenChat?: (chat: { matchId: string; name: string; photo: string | null }) => void;
}

const LikesView = ({ onOpenChat }: LikesViewProps) => {
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [selectedProfile, setSelectedProfile] = useState<LikeProfile | null>(null);
  const { data: whoLikedMe = [], isLoading: loadingReceived } = useWhoLikedMe();
  const { data: whoILiked = [], isLoading: loadingSent } = useWhoILiked();
  const likeBack = useLikeBack();
  const swipe = useSwipe();

  const handleLikeBack = async (profile: LikeProfile) => {
    try {
      const result = await likeBack.mutateAsync({ userId: profile.user_id });
      setSelectedProfile(null);
      if (result.match) {
        toast.success(`It's a match with ${profile.display_name}! 🎉`, {
          action: {
            label: 'Message',
            onClick: () => {
              if (onOpenChat && result.match) {
                onOpenChat({
                  matchId: result.match.id,
                  name: profile.display_name || 'Match',
                  photo: profile.photos[0] || null,
                });
              }
            },
          },
        });
      } else {
        toast.success(`Liked ${profile.display_name} back!`);
      }
    } catch (error) {
      toast.error("Failed to like back");
    }
  };

  const handlePass = async (profile: LikeProfile) => {
    try {
      await swipe.mutateAsync({ swipedId: profile.user_id, direction: 'pass' });
      setSelectedProfile(null);
      toast.info(`Passed on ${profile.display_name}`);
    } catch (error) {
      toast.error("Failed to pass");
    }
  };

  const handleProfileClick = (profile: LikeProfile) => {
    setSelectedProfile(profile);
  };

  const renderProfileCard = (profile: LikeProfile, showActions: boolean) => (
    <motion.div
      key={profile.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      onClick={() => handleProfileClick(profile)}
      className="relative rounded-xl overflow-hidden bg-card shadow-card cursor-pointer active:scale-[0.98] transition-transform"
    >
      <div className="relative aspect-[3/4]">
        {profile.photos[0] ? (
          <img
            src={profile.photos[0]}
            alt={profile.display_name || "Profile"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <User className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent" />
        
        {profile.direction === 'superlike' && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-accent/90 text-accent-foreground border-0 text-[10px] px-2 py-0.5">
              <Star className="w-2.5 h-2.5 mr-0.5 fill-current" />
              Super
            </Badge>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-2.5 text-card">
          <h3 className="font-semibold text-sm truncate">
            {profile.display_name}, {profile.age}
          </h3>
          <p className="text-card/80 text-xs">
            {profile.distance} mi away
          </p>
          <p className="text-card/60 text-[10px] mt-0.5">
            {formatDistanceToNow(new Date(profile.liked_at), { addSuffix: true })}
          </p>
        </div>
      </div>

      {showActions && (
        <div className="flex gap-1.5 p-2 bg-card">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handlePass(profile);
            }}
            className="flex-1 h-8 text-xs"
          >
            <X className="w-3.5 h-3.5 mr-1" />
            Pass
          </Button>
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleLikeBack(profile);
            }}
            className="flex-1 h-8 text-xs gradient-primary text-primary-foreground"
            disabled={likeBack.isPending}
          >
            <Heart className="w-3.5 h-3.5 mr-1 fill-current" />
            Like
          </Button>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="pt-16 pb-20 px-3">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-serif font-bold text-foreground">
            Likes
          </h1>
          <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">
            <Crown className="w-2.5 h-2.5 mr-0.5" />
            Premium
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          See who's interested in you
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-4">
        <Button
          variant={activeTab === 'received' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('received')}
          className={`flex-1 h-9 text-xs ${activeTab === 'received' ? 'gradient-primary text-primary-foreground' : ''}`}
        >
          <Heart className="w-3.5 h-3.5 mr-1.5" />
          Liked You ({whoLikedMe.length})
        </Button>
        <Button
          variant={activeTab === 'sent' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('sent')}
          className={`flex-1 h-9 text-xs ${activeTab === 'sent' ? 'gradient-primary text-primary-foreground' : ''}`}
        >
          <Sparkles className="w-3.5 h-3.5 mr-1.5" />
          You Liked ({whoILiked.length})
        </Button>
      </div>

      {/* Content */}
      {(activeTab === 'received' ? loadingReceived : loadingSent) ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: activeTab === 'received' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: activeTab === 'received' ? 20 : -20 }}
          >
            {activeTab === 'received' ? (
              whoLikedMe.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {whoLikedMe.map((profile) => renderProfileCard(profile, true))}
                </div>
              ) : (
                <EmptyState
                  icon={Heart}
                  title="No likes yet"
                  description="When someone likes your profile, they'll appear here."
                />
              )
            ) : (
              whoILiked.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {whoILiked.map((profile) => renderProfileCard(profile, false))}
                </div>
              ) : (
                <EmptyState
                  icon={Sparkles}
                  title="No pending likes"
                  description="Profiles you've liked that haven't matched yet will appear here."
                />
              )
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Profile Modal */}
      <LikeProfileModal
        profile={selectedProfile}
        isOpen={!!selectedProfile}
        onClose={() => setSelectedProfile(null)}
        onLikeBack={handleLikeBack}
        onPass={handlePass}
        showActions={activeTab === 'received'}
      />
    </div>
  );
};

const EmptyState = ({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: typeof Heart; 
  title: string; 
  description: string;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="text-center py-14"
  >
    <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
      <Icon className="w-8 h-8 text-muted-foreground" />
    </div>
    <h2 className="text-lg font-semibold text-foreground mb-1">{title}</h2>
    <p className="text-sm text-muted-foreground max-w-xs mx-auto">{description}</p>
  </motion.div>
);

export default LikesView;