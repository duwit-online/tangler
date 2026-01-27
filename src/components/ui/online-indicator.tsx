import { cn } from '@/lib/utils';

interface OnlineIndicatorProps {
  isOnline: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
}

const sizeClasses = {
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
};

export const OnlineIndicator = ({ 
  isOnline, 
  size = 'md', 
  className,
  showLabel = false 
}: OnlineIndicatorProps) => {
  if (!isOnline) return null;

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div 
        className={cn(
          'rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]',
          sizeClasses[size],
          isOnline && 'animate-pulse'
        )} 
      />
      {showLabel && (
        <span className="text-xs font-medium text-green-600 dark:text-green-400">
          Online
        </span>
      )}
    </div>
  );
};
