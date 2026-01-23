import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Star, Crown, Loader2, Sparkles, Check, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useWhoLikedMe, useWhoILiked, useLikeBack, LikeProfile } from "@/hooks/useLikes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface LikesViewProps {
  onOpenChat?: (chat: { matchId: string; name: string; photo: string | null }) => void;
}

const LikesView = ({ onOpenChat }: LikesViewProps) => {
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const { data: whoLikedMe = [], isLoading: loadingReceived } = useWhoLikedMe();
  const { data: whoILiked = [], isLoading: loadingSent } = useWhoILiked();
  const likeBack = useLikeBack();

  const handleLikeBack = async (profile: LikeProfile) => {
    try {
      const result = await likeBack.mutateAsync({ userId: profile.user_id });
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
    // We could implement a "pass" feature here if needed
    toast.info(`Passed on ${profile.display_name}`);
  };

  const renderProfileCard = (profile: LikeProfile, showActions: boolean) => (
    <motion.div
      key={profile.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="relative rounded-2xl overflow-hidden bg-card shadow-card"
    >
      <div className="relative aspect-[3/4]">
        <img
          src={profile.photos[0]}
          alt={profile.display_name || "Profile"}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent" />
        
        {/* Super Like indicator */}
        {profile.direction === 'superlike' && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-yellow-500/90 text-white border-0">
              <Star className="w-3 h-3 mr-1 fill-current" />
              Super Like
            </Badge>
          </div>
        )}

        {/* Profile info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-card">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg">
              {profile.display_name}, {profile.age}
            </h3>
          </div>
          <p className="text-card/80 text-sm mb-2">
            {profile.distance} mi away
          </p>
          <p className="text-card/60 text-xs">
            {formatDistanceToNow(new Date(profile.liked_at), { addSuffix: true })}
          </p>
        </div>
      </div>

      {/* Action buttons for received likes */}
      {showActions && (
        <div className="flex gap-2 p-3 bg-card">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePass(profile)}
            className="flex-1"
          >
            <X className="w-4 h-4 mr-1" />
            Pass
          </Button>
          <Button
            size="sm"
            onClick={() => handleLikeBack(profile)}
            className="flex-1 gradient-primary text-primary-foreground"
            disabled={likeBack.isPending}
          >
            <Heart className="w-4 h-4 mr-1 fill-current" />
            Like Back
          </Button>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="pt-20 pb-24 px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-3xl font-serif font-bold text-foreground">
            Likes
          </h1>
          <Badge className="bg-primary/10 text-primary border-primary/20">
            <Crown className="w-3 h-3 mr-1" />
            Premium
          </Badge>
        </div>
        <p className="text-muted-foreground">
          See who's interested in you
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === 'received' ? 'default' : 'outline'}
          onClick={() => setActiveTab('received')}
          className={activeTab === 'received' ? 'gradient-primary text-primary-foreground' : ''}
        >
          <Heart className="w-4 h-4 mr-2" />
          Liked You ({whoLikedMe.length})
        </Button>
        <Button
          variant={activeTab === 'sent' ? 'default' : 'outline'}
          onClick={() => setActiveTab('sent')}
          className={activeTab === 'sent' ? 'gradient-primary text-primary-foreground' : ''}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          You Liked ({whoILiked.length})
        </Button>
      </div>

      {/* Content */}
      {(activeTab === 'received' ? loadingReceived : loadingSent) ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
    <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
      <Icon className="w-10 h-10 text-muted-foreground" />
    </div>
    <h2 className="text-xl font-semibold text-foreground mb-2">{title}</h2>
    <p className="text-muted-foreground max-w-xs mx-auto">{description}</p>
  </motion.div>
);

export default LikesView;
