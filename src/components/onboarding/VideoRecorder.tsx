import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, 
  Square, 
  Play, 
  Trash2, 
  Upload, 
  Camera,
  Loader2,
  Check,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVideoRecorder, useUploadVideo } from '@/hooks/useVideoUpload';
import { cn } from '@/lib/utils';

interface VideoRecorderProps {
  onVideoUploaded?: (url: string) => void;
  existingVideoUrl?: string | null;
}

const VideoRecorder = ({ onVideoUploaded, existingVideoUrl }: VideoRecorderProps) => {
  const {
    isRecording,
    videoUrl,
    videoFile,
    duration,
    error,
    stream,
    startRecording,
    stopRecording,
    clearVideo,
    handleFileSelect,
    maxDuration,
  } = useVideoRecorder();

  const uploadVideo = useUploadVideo();
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [liveStream, setLiveStream] = useState<MediaStream | null>(null);

  // Handle live preview during recording
  useEffect(() => {
    if (isRecording && videoRef.current && liveStream) {
      videoRef.current.srcObject = liveStream;
      videoRef.current.play();
    }
  }, [isRecording, liveStream]);

  // Handle recorded video preview
  useEffect(() => {
    if (videoUrl && videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.src = videoUrl;
    }
  }, [videoUrl]);

  const handleStartRecording = async () => {
    try {
      const stream = await startRecording();
      setLiveStream(stream);
    } catch {
      // Error is handled in the hook
    }
  };

  const handleStopRecording = () => {
    stopRecording();
    setLiveStream(null);
  };

  const handleUpload = async () => {
    if (!videoFile) return;

    try {
      const url = await uploadVideo.mutateAsync(videoFile);
      onVideoUploaded?.(url);
      setShowPreview(true);
    } catch {
      // Error is handled in the hook
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div className="space-y-4">
      {/* Video container */}
      <div className="relative aspect-[9/16] max-h-[400px] mx-auto rounded-2xl overflow-hidden bg-secondary">
        {(isRecording || videoUrl || existingVideoUrl) ? (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted={isRecording}
              controls={!!videoUrl && !isRecording}
              src={existingVideoUrl && !videoUrl ? existingVideoUrl : undefined}
            />

            {/* Recording indicator */}
            {isRecording && (
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
                <span className="text-sm font-medium text-card bg-foreground/60 px-2 py-1 rounded-full">
                  {duration}s / {maxDuration}s
                </span>
              </div>
            )}

            {/* Recording progress bar */}
            {isRecording && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-secondary">
                <motion.div
                  className="h-full bg-destructive"
                  initial={{ width: '0%' }}
                  animate={{ width: `${(duration / maxDuration) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            <Video className="w-16 h-16 mb-4" />
            <p className="text-sm text-center px-4">
              Record or upload a short video introduction
            </p>
            <p className="text-xs mt-1">Max {maxDuration} seconds</p>
          </div>
        )}
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-xl"
          >
            <X className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 justify-center">
        {!isRecording && !videoUrl && !existingVideoUrl && (
          <>
            <Button
              onClick={handleStartRecording}
              className="gradient-primary text-primary-foreground"
            >
              <Camera className="w-4 h-4 mr-2" />
              Record Video
            </Button>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Video
            </Button>
          </>
        )}

        {isRecording && (
          <Button
            onClick={handleStopRecording}
            variant="destructive"
            className="animate-pulse"
          >
            <Square className="w-4 h-4 mr-2" />
            Stop Recording ({maxDuration - duration}s left)
          </Button>
        )}

        {videoUrl && !isRecording && (
          <>
            <Button
              onClick={handleUpload}
              disabled={uploadVideo.isPending}
              className="gradient-primary text-primary-foreground"
            >
              {uploadVideo.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Save Video
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                clearVideo();
                setLiveStream(null);
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Retake
            </Button>
          </>
        )}

        {existingVideoUrl && !videoUrl && (
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            Change Video
          </Button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Tips */}
      <div className="text-center text-xs text-muted-foreground space-y-1">
        <p>💡 Tips for a great video:</p>
        <p>• Good lighting • Smile and be yourself • Share a fun fact</p>
      </div>
    </div>
  );
};

export default VideoRecorder;
