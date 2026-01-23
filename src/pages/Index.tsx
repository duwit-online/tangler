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
import { useDiscoverProfiles, useSwipeWithUndo, DiscoverProfile } from "@/hooks/useSwipes";
import { useSmartDiscoverProfiles } from "@/hooks/useSmartMatching";
import { Loader2, Heart } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [activeTab, setActiveTab] = useState("discover");
  const [matchedProfile, setMatchedProfile] = useState<DiscoverProfile | null>(null);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [activeChat, setActiveChat] = useState<{
    matchId: string;
    name: string;
    photo: string | null;
  } | null>(null);

  // Use smart matching for discover - filters by gender preferences
  const { data: profiles = [], isLoading } = useSmartDiscoverProfiles();
  const { swipe: swipeMutation, undo: undoMutation, canUndo } = useSwipeWithUndo();

  const handleSwipe = async (direction: "left" | "right") => {
    const currentProfile = profiles[0];
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
    const currentProfile = profiles[0];
    if (!currentProfile) return;

    try {
      const result = await swipeMutation.mutateAsync({
        swipedId: currentProfile.user_id,
        direction: "superlike",
        profile: currentProfile,
      });

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
          <div className="flex flex-col h-full pt-20 pb-24">
            <div className="relative flex-1 mx-4">
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-10 h-10 animate-spin text-primary" />
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {profiles.length > 0 ? (
                    profiles.slice(0, 3).reverse().map((profile, index) => (
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
                        isTop={index === Math.min(profiles.length, 3) - 1}
                      />
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute inset-0 flex flex-col items-center justify-center text-center p-8"
                    >
                      <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center mb-6 animate-pulse-glow">
                        <Heart className="w-12 h-12 text-primary-foreground" />
                      </div>
                      <h2 className="text-2xl font-serif font-semibold text-foreground mb-2">
                        No more profiles
                      </h2>
                      <p className="text-muted-foreground max-w-xs">
                        You've seen everyone nearby. Check back later!
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>

            {profiles.length > 0 && (
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
        return <ExploreView onViewLikes={() => setActiveTab("likes")} />;
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
    <div className="min-h-screen bg-background gradient-warm">
      <Header onNotificationClick={() => setActiveTab("notifications")} />
      
      <main className="min-h-screen max-w-md mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-screen"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

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
          setActiveTab("messages");
        }}
      />

      {activeChat && (
        <ChatView
          matchId={activeChat.matchId}
          matchName={activeChat.name}
          matchPhoto={activeChat.photo}
          onBack={() => setActiveChat(null)}
        />
      )}
    </div>
  );
};

export default Index;
