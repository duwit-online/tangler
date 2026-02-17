import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import ProfileCard from "@/components/ProfileCard";
import SwipeButtons from "@/components/SwipeButtons";
import MatchModal from "@/components/MatchModal";
import MatchesView from "@/components/MatchesView";
import MessagesView from "@/components/MessagesView";
import ProfileView from "@/components/ProfileView";
import ChatView from "@/components/ChatView";
import NotificationsView from "@/components/NotificationsView";
import ExploreView from "@/components/ExploreView";
import LikesView from "@/components/LikesView";
import { useSwipeWithUndo, DiscoverProfile } from "@/hooks/useSwipes";
import { useSmartDiscoverProfiles } from "@/hooks/useSmartMatching";
import { useUpdateLastSeen } from "@/hooks/useOnlineStatus";
import { useDiscoverSearch } from "@/hooks/useDiscoverSearch";
import { useSuperLikeAnimation } from "@/hooks/useSuperLikeAnimation";
import { Loader2, Heart, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const pageVariants = {
  initial: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 60 : -60,
    scale: 0.97,
  }),
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -60 : 60,
    scale: 0.97,
    transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

const tabOrder = ["discover", "explore", "likes", "matches", "messages", "notifications", "profile"];

const Index = () => {
  const [activeTab, setActiveTab] = useState("discover");
  const [prevTab, setPrevTab] = useState("discover");
  const [matchedProfile, setMatchedProfile] = useState<DiscoverProfile | null>(null);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [showDiscoverSearch, setShowDiscoverSearch] = useState(false);
  const [activeChat, setActiveChat] = useState<{
    matchId: string;
    name: string;
    photo: string | null;
    userId?: string;
  } | null>(null);

  useUpdateLastSeen();

  const { data: profiles = [], isLoading } = useSmartDiscoverProfiles();
  const { swipe: swipeMutation, undo: undoMutation, canUndo } = useSwipeWithUndo();
  const { searchQuery, setSearchQuery, filteredProfiles, isSearching } = useDiscoverSearch(profiles);
  const { triggerSuperLikeEffect } = useSuperLikeAnimation();

  const displayProfiles = isSearching ? filteredProfiles : profiles;

  const direction = tabOrder.indexOf(activeTab) >= tabOrder.indexOf(prevTab) ? 1 : -1;

  const handleTabChange = (tab: string) => {
    setPrevTab(activeTab);
    setActiveTab(tab);
  };

  const handleSwipe = async (direction: "left" | "right") => {
    const currentProfile = displayProfiles[0];
    if (!currentProfile) return;

    const swipeDirection = direction === "right" ? "like" : "pass";
    
    try {
      const result = await swipeMutation.mutateAsync({
        swipedId: currentProfile.user_id,
        direction: swipeDirection,
        profile: currentProfile,
      });

      if (result.match) {
        setMatchedProfile(currentProfile);
        setIsMatchModalOpen(true);
      }
    } catch (error) {
      console.error("Swipe failed:", error);
      toast.error("Swipe failed. Please try again.");
    }
  };

  const handleSuperLike = async () => {
    const currentProfile = displayProfiles[0];
    if (!currentProfile) return;

    triggerSuperLikeEffect();

    try {
      const result = await swipeMutation.mutateAsync({
        swipedId: currentProfile.user_id,
        direction: "superlike",
        profile: currentProfile,
      });

      toast.success(`Super liked ${currentProfile.display_name}! ⭐`);

      if (result.match) {
        setMatchedProfile(currentProfile);
        setIsMatchModalOpen(true);
      }
    } catch (error) {
      console.error("Super like failed:", error);
      toast.error("Super like failed. Please try again.");
    }
  };

  const handleUndo = async () => {
    try {
      await undoMutation.mutateAsync();
      toast.success("Swipe undone!");
    } catch (error) {
      console.error("Undo failed:", error);
      toast.error("Couldn't undo. Please try again.");
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "discover":
        return (
          <div className="flex flex-col h-full pt-16 pb-20">
            <div className="px-4 mb-3">
              {showDiscoverSearch ? (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2"
                >
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, interests..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-11 rounded-2xl bg-card border-border/50 text-sm shadow-card"
                      autoFocus
                    />
                  </div>
                  <button
                    onClick={() => {
                      setShowDiscoverSearch(false);
                      setSearchQuery("");
                    }}
                    className="p-2.5 hover:bg-secondary rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </motion.div>
              ) : (
                <button
                  onClick={() => setShowDiscoverSearch(true)}
                  className="w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-card border border-border/50 text-muted-foreground text-sm hover:border-primary/30 transition-all shadow-card"
                >
                  <Search className="w-4 h-4" />
                  Search profiles...
                </button>
              )}
            </div>

            <div className="relative flex-1 mx-4">
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {displayProfiles.length > 0 ? (
                    displayProfiles.slice(0, 3).reverse().map((profile, index) => (
                      <ProfileCard
                        key={profile.id}
                        profile={{
                          id: profile.id,
                          name: profile.display_name || "Unknown",
                          age: profile.age || 25,
                          bio: profile.bio || "",
                          location: profile.location || "",
                          occupation: "",
                          distance: profile.distance || 5,
                          images: profile.photos,
                          interests: profile.interests || [],
                          verified: true,
                        }}
                        onSwipe={handleSwipe}
                        isTop={index === Math.min(displayProfiles.length, 3) - 1}
                      />
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute inset-0 flex flex-col items-center justify-center text-center p-8"
                    >
                      <div className="w-20 h-20 rounded-3xl gradient-primary flex items-center justify-center mb-6 shadow-glow">
                        <Heart className="w-10 h-10 text-primary-foreground fill-primary-foreground" />
                      </div>
                      <h2 className="text-xl font-serif font-bold text-foreground mb-2">
                        {isSearching ? "No results found" : "No more profiles"}
                      </h2>
                      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                        {isSearching 
                          ? "Try a different search term" 
                          : "You've seen everyone nearby. Check back later!"}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>

            {displayProfiles.length > 0 && (
              <SwipeButtons
                onSwipe={handleSwipe}
                onSuperLike={handleSuperLike}
                onUndo={handleUndo}
                canUndo={canUndo}
              />
            )}
          </div>
        );
      case "explore":
        return <ExploreView onViewLikes={() => handleTabChange("likes")} />;
      case "likes":
        return <LikesView onOpenChat={setActiveChat} />;
      case "matches":
        return <MatchesView onOpenChat={setActiveChat} />;
      case "messages":
        return <MessagesView onOpenChat={setActiveChat} />;
      case "notifications":
        return <NotificationsView onOpenChat={setActiveChat} />;
      case "profile":
        return <ProfileView />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background gradient-hero">
      <Header onNotificationClick={() => handleTabChange("notifications")} />
      
      <main className="min-h-screen max-w-md mx-auto">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={activeTab}
            custom={direction}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="h-screen"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />

      <MatchModal
        isOpen={isMatchModalOpen}
        onClose={() => setIsMatchModalOpen(false)}
        profile={matchedProfile ? {
          id: matchedProfile.id,
          name: matchedProfile.display_name || "Unknown",
          age: matchedProfile.age || 25,
          bio: matchedProfile.bio || "",
          location: matchedProfile.location || "",
          occupation: "",
          distance: matchedProfile.distance || 5,
          images: matchedProfile.photos,
          interests: matchedProfile.interests || [],
          verified: true,
        } : null}
        onMessage={() => {
          setIsMatchModalOpen(false);
          handleTabChange("messages");
        }}
      />

      {activeChat && (
        <ChatView
          matchId={activeChat.matchId}
          matchName={activeChat.name}
          matchPhoto={activeChat.photo}
          matchUserId={activeChat.userId}
          onBack={() => setActiveChat(null)}
        />
      )}
    </div>
  );
};

export default Index;
