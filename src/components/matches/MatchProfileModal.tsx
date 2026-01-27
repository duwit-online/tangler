import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Heart, MapPin, UserX, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUnmatch } from '@/hooks/useUnmatch';
import { useIsUserOnline } from '@/hooks/useOnlineStatus';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface MatchProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: {
    id: string;
    other_user_id: string;
    profile: {
      display_name: string | null;
      bio: string | null;
      age: number | null;
    };
    photo: string | null;
  } | null;
  onOpenChat: () => void;
}

const MatchProfileModal = ({ isOpen, onClose, match, onOpenChat }: MatchProfileModalProps) => {
  const unmatch = useUnmatch();
  const { data: isOnline } = useIsUserOnline(match?.other_user_id || null);
  const [showUnmatchDialog, setShowUnmatchDialog] = useState(false);

  if (!match) return null;

  const handleUnmatch = async () => {
    await unmatch.mutateAsync(match.id);
    setShowUnmatchDialog(false);
    onClose();
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
            onClick={onClose}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-card rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Photo */}
              <div className="relative aspect-[4/5] bg-muted">
                {match.photo ? (
                  <img
                    src={match.photo}
                    alt={match.profile.display_name || 'Match'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-6xl font-semibold">
                    {(match.profile.display_name || '?').charAt(0)}
                  </div>
                )}

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Online indicator */}
                {isOnline && (
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-white text-xs font-medium">Online</span>
                  </div>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-card to-transparent" />
              </div>

              {/* Content */}
              <div className="p-5 -mt-16 relative flex-1 overflow-y-auto">
                <div className="flex items-end gap-3 mb-4">
                  <h2 className="text-2xl font-bold text-foreground font-serif">
                    {match.profile.display_name || 'Unknown'}
                    {match.profile.age && `, ${match.profile.age}`}
                  </h2>
                  {isOnline && (
                    <div className="w-3 h-3 rounded-full bg-green-500 mb-1.5" />
                  )}
                </div>

                {match.profile.bio && (
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                    {match.profile.bio}
                  </p>
                )}

                {/* Action buttons */}
                <div className="flex gap-3 mb-4">
                  <Button
                    onClick={onOpenChat}
                    className="flex-1 h-12 rounded-xl gradient-primary text-primary-foreground font-medium gap-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Message
                  </Button>
                </div>

                {/* Unmatch button */}
                <Button
                  variant="ghost"
                  onClick={() => setShowUnmatchDialog(true)}
                  className="w-full h-11 text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
                >
                  <UserX className="w-4 h-4" />
                  Unmatch
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unmatch confirmation dialog */}
      <AlertDialog open={showUnmatchDialog} onOpenChange={setShowUnmatchDialog}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Unmatch {match.profile.display_name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove your match and you won't be able to message each other. 
              They will appear in your discover feed again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnmatch}
              disabled={unmatch.isPending}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {unmatch.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Unmatch'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MatchProfileModal;
