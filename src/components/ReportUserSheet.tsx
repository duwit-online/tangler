import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ChevronRight, Send } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useReport, ReportReason } from '@/hooks/useReport';

interface ReportUserSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportedUserId: string;
  reportedUserName?: string;
  contentType?: string;
  contentId?: string;
}

const ReportUserSheet = ({
  open,
  onOpenChange,
  reportedUserId,
  reportedUserName,
  contentType = 'profile',
  contentId,
}: ReportUserSheetProps) => {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const { submitReport, isSubmitting, reportReasons } = useReport();

  const handleSubmit = async () => {
    if (!selectedReason) return;

    const success = await submitReport({
      reportedUserId,
      reason: selectedReason,
      description: description.trim() || undefined,
      contentType,
      contentId,
    });

    if (success) {
      setSelectedReason(null);
      setDescription('');
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-lg font-serif flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Report {reportedUserName || 'User'}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Please select a reason for reporting. Your report is anonymous and will be reviewed by our team.
          </p>

          <div className="space-y-2">
            {reportReasons.map((reason) => (
              <motion.button
                key={reason}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedReason(reason)}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                  selectedReason === reason
                    ? 'border-primary bg-primary/5 text-foreground'
                    : 'border-border bg-card text-foreground hover:border-primary/30'
                }`}
              >
                <span className="text-sm">{reason}</span>
                {selectedReason === reason && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <ChevronRight className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
              </motion.button>
            ))}
          </div>

          {selectedReason && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-2"
            >
              <label className="text-sm font-medium text-foreground">
                Additional details (optional)
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us more about what happened..."
                className="bg-secondary border-0 rounded-xl resize-none"
                rows={3}
              />
            </motion.div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={!selectedReason || isSubmitting}
            className="w-full h-12 rounded-xl gradient-primary text-primary-foreground"
          >
            <Send className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>

          <p className="text-[10px] text-muted-foreground text-center">
            False reports may result in action against your account.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ReportUserSheet;
