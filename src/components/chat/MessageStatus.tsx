import { Check, CheckCheck, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageStatusProps {
  status: 'sent' | 'delivered' | 'read' | null;
  readAt: string | null;
  className?: string;
}

export const MessageStatus = ({ status, readAt, className }: MessageStatusProps) => {
  // Use readAt for backwards compatibility
  const effectiveStatus = readAt ? 'read' : status || 'sent';

  return (
    <span className={cn('inline-flex', className)}>
      {effectiveStatus === 'sent' && (
        <Check className="w-4 h-4 opacity-70" />
      )}
      {effectiveStatus === 'delivered' && (
        <CheckCheck className="w-4 h-4 opacity-70" />
      )}
      {effectiveStatus === 'read' && (
        <CheckCheck className="w-4 h-4 text-accent" />
      )}
    </span>
  );
};
