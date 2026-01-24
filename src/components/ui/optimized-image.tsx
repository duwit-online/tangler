import { useState, useRef, useEffect, ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src: string;
  alt: string;
  fallback?: string;
  aspectRatio?: "square" | "portrait" | "landscape" | "auto";
  priority?: boolean;
  onLoadComplete?: () => void;
}

// Convert image URL to WebP format if supported
const getOptimizedUrl = (url: string): string => {
  // If it's a Supabase storage URL, we can add transform parameters
  if (url.includes("supabase") && url.includes("/storage/")) {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}format=webp&quality=80`;
  }
  return url;
};

export const OptimizedImage = ({
  src,
  alt,
  fallback = "/placeholder.svg",
  aspectRatio = "auto",
  priority = false,
  className,
  onLoadComplete,
  ...props
}: OptimizedImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "200px", // Start loading 200px before entering viewport
        threshold: 0.01,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoadComplete?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const aspectRatioClasses = {
    square: "aspect-square",
    portrait: "aspect-[3/4]",
    landscape: "aspect-[4/3]",
    auto: "",
  };

  const optimizedSrc = getOptimizedUrl(src);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden bg-muted",
        aspectRatioClasses[aspectRatio],
        className
      )}
    >
      {isLoading && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}
      
      {isInView && (
        <picture>
          {/* WebP source for modern browsers */}
          <source
            srcSet={optimizedSrc}
            type="image/webp"
          />
          {/* Fallback for older browsers */}
          <img
            ref={imgRef}
            src={hasError ? fallback : src}
            alt={alt}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              "w-full h-full object-cover transition-opacity duration-300",
              isLoading ? "opacity-0" : "opacity-100"
            )}
            {...props}
          />
        </picture>
      )}

      {!isInView && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
    </div>
  );
};

// Preload critical images
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = getOptimizedUrl(src);
  });
};

// Preload multiple images in parallel
export const preloadImages = async (srcs: string[]): Promise<void> => {
  await Promise.allSettled(srcs.map(preloadImage));
};
