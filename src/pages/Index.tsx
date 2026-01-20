import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import ProfileCard from "@/components/ProfileCard";
import SwipeButtons from "@/components/SwipeButtons";
import MatchModal from "@/components/MatchModal";
import MatchesView from "@/components/MatchesView";
import MessagesView from "@/components/MessagesView";
import ProfileView from "@/components/ProfileView";
import { profiles, Profile } from "@/data/profiles";

const Index = () => {
  const [activeTab, setActiveTab] = useState("discover");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipedProfiles, setSwipedProfiles] = useState<string[]>([]);
  const [matchedProfile, setMatchedProfile] = useState<Profile | null>(null);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);

  const availableProfiles = useMemo(
    () => profiles.filter((p) => !swipedProfiles.includes(p.id)),
    [swipedProfiles]
  );

  const handleSwipe = (direction: "left" | "right") => {
    const currentProfile = availableProfiles[0];
    if (!currentProfile) return;

    setSwipedProfiles((prev) => [...prev, currentProfile.id]);

    // Simulate a match on right swipe (30% chance)
    if (direction === "right" && Math.random() > 0.7) {
      setTimeout(() => {
        setMatchedProfile(currentProfile);
        setIsMatchModalOpen(true);
      }, 300);
    }
  };

  const handleSuperLike = () => {
    const currentProfile = availableProfiles[0];
    if (!currentProfile) return;
    
    setSwipedProfiles((prev) => [...prev, currentProfile.id]);
    setMatchedProfile(currentProfile);
    setIsMatchModalOpen(true);
  };

  const handleUndo = () => {
    if (swipedProfiles.length === 0) return;
    setSwipedProfiles((prev) => prev.slice(0, -1));
  };

  const renderContent = () => {
    switch (activeTab) {
      case "discover":
        return (
          <div className="flex flex-col h-full pt-20 pb-24">
            {/* Card stack */}
            <div className="relative flex-1 mx-4">
              <AnimatePresence mode="popLayout">
                {availableProfiles.length > 0 ? (
                  availableProfiles
                    .slice(0, 3)
                    .reverse()
                    .map((profile, index) => (
                      <ProfileCard
                        key={profile.id}
                        profile={profile}
                        onSwipe={handleSwipe}
                        isTop={index === availableProfiles.slice(0, 3).length - 1}
                      />
                    ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 flex flex-col items-center justify-center text-center p-8"
                  >
                    <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center mb-6 animate-pulse-glow">
                      <svg
                        className="w-12 h-12 text-primary-foreground"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-serif font-semibold text-foreground mb-2">
                      No more profiles
                    </h2>
                    <p className="text-muted-foreground max-w-xs">
                      You've seen everyone nearby. Check back later for new connections!
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Swipe buttons */}
            {availableProfiles.length > 0 && (
              <SwipeButtons
                onSwipe={handleSwipe}
                onSuperLike={handleSuperLike}
                onUndo={handleUndo}
                canUndo={swipedProfiles.length > 0}
              />
            )}
          </div>
        );
      case "matches":
        return <MatchesView />;
      case "messages":
        return <MessagesView />;
      case "profile":
        return <ProfileView />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background gradient-warm">
      <Header />
      
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
        profile={matchedProfile}
        onMessage={() => {
          setIsMatchModalOpen(false);
          setActiveTab("messages");
        }}
      />
    </div>
  );
};

export default Index;
