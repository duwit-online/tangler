import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

const REPORT_REASONS = [
  'Inappropriate photos',
  'Fake profile / Catfishing',
  'Harassment or bullying',
  'Spam or scam',
  'Underage user',
  'Hate speech',
  'Other',
] as const;

export type ReportReason = typeof REPORT_REASONS[number];

export const useReport = () => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitReport = async ({
    reportedUserId,
    reason,
    description,
    contentType = 'profile',
    contentId,
  }: {
    reportedUserId: string;
    reason: string;
    description?: string;
    contentType?: string;
    contentId?: string;
  }) => {
    if (!user) {
      toast.error('You must be logged in to report');
      return false;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('user_reports').insert({
        reporter_id: user.id,
        reported_user_id: reportedUserId,
        reason,
        description: description || null,
        reported_content_type: contentType,
        reported_content_id: contentId || null,
      });

      if (error) throw error;

      toast.success('Report submitted', {
        description: 'Thank you for keeping Tangle safe. We\'ll review this shortly.',
      });
      return true;
    } catch (error) {
      console.error('Failed to submit report:', error);
      toast.error('Failed to submit report');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitReport, isSubmitting, reportReasons: REPORT_REASONS };
};
