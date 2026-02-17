import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Star, Loader2, Sparkles, X, User } from "lucide-react";
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
      className="relative rounded-2xl overflow-hidden bg-card shadow-card cursor-pointer active:scale-[0.98] transition-transform group"
    >
      <div className="relative aspect-[3/4]">
        {profile.photos[0] ? (
          <img
            src={profile.photos[0]}
            alt={profile.display_name || "Profile"}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <User className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/10 to-transparent" />
        
        {profile.direction === 'superlike' && (
          <div className="absolute top-2.5 right-2.5">
            <Badge className="gradient-lavender text-accent-foreground border-0 text-[10px] px-2.5 py-1 shadow-card">
              <Star className="w-3 h-3 mr-1 fill-current" />
              Super Like
            </Badge>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-3 text-card">
          <h3 className="font-serif font-semibold text-base truncate">
            {profile.display_name}, {profile.age}
          </h3>
          <p className="text-card/80 text-xs mt-0.5">
            {profile.distance} mi away
          </p>
          <p className="text-card/50 text-[10px] mt-0.5">
            {formatDistanceToNow(new Date(profile.liked_at), { addSuffix: true })}
          </p>
        </div>
      </div>

      {showActions && (
        <div className="flex gap-2 p-2.5 bg-card border-t border-border/50">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handlePass(profile);
            }}
            className="flex-1 h-9 text-xs rounded-xl"
          >
            <X className="w-3.5 h-3.5 mr-1.5" />
            Pass
          </Button>
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleLikeBack(profile);
            }}
            className="flex-1 h-9 text-xs gradient-primary text-primary-foreground rounded-xl shadow-glow"
            disabled={likeBack.isPending}
          >
            <Heart className="w-3.5 h-3.5 mr-1.5 fill-current" />
            Like Back
          </Button>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="pt-16 pb-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5"
      >
        <h1 className="text-2xl font-serif font-bold text-foreground mb-1">
          Likes
        </h1>
        <p className="text-sm text-muted-foreground">
          See who's interested in you
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 p-1 bg-secondary/60 rounded-2xl">
        <button
          onClick={() => setActiveTab('received')}
          className={`flex-1 flex items-center justify-center gap-1.5 h-10 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'received' 
              ? 'gradient-primary text-primary-foreground shadow-card' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          Liked You ({whoLikedMe.length})
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`flex-1 flex items-center justify-center gap-1.5 h-10 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'sent' 
              ? 'gradient-primary text-primary-foreground shadow-card' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          You Liked ({whoILiked.length})
        </button>
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
            transition={{ duration: 0.25 }}
          >
            {activeTab === 'received' ? (
              whoLikedMe.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
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
                <div className="grid grid-cols-2 gap-3">
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
    className="text-center py-16"
  >
    <div className="w-18 h-18 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 w-[72px] h-[72px]">
      <Icon className="w-8 h-8 text-primary" />
    </div>
    <h2 className="text-lg font-serif font-semibold text-foreground mb-1.5">{title}</h2>
    <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">{description}</p>
  </motion.div>
);

export default LikesView;
