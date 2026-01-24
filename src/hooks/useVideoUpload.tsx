import { useState, useRef, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_VIDEO_DURATION = 30; // 30 seconds
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

interface VideoUploadState {
  isRecording: boolean;
  isPlaying: boolean;
  videoUrl: string | null;
  videoFile: File | null;
  duration: number;
  error: string | null;
}

export const useVideoRecorder = () => {
  const [state, setState] = useState<VideoUploadState>({
    isRecording: false,
    isPlaying: false,
    videoUrl: null,
    videoFile: null,
    duration: 0,
    error: null,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      // Request camera and microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',
          width: { ideal: 720 },
          height: { ideal: 1280 },
        },
        audio: true,
      });

      streamRef.current = stream;
      chunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : 'video/mp4',
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const file = new File([blob], `video-${Date.now()}.webm`, { type: 'video/webm' });

        setState(prev => ({
          ...prev,
          isRecording: false,
          videoUrl: url,
          videoFile: file,
        }));

        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start(1000); // Collect data every second

      // Start duration timer
      let duration = 0;
      timerRef.current = setInterval(() => {
        duration += 1;
        setState(prev => ({ ...prev, duration }));
        
        if (duration >= MAX_VIDEO_DURATION) {
          stopRecording();
        }
      }, 1000);

      setState(prev => ({
        ...prev,
        isRecording: true,
        duration: 0,
        error: null,
      }));

      return stream;
    } catch (error) {
      console.error('Failed to start recording:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to access camera. Please check permissions.',
      }));
      throw error;
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const clearVideo = useCallback(() => {
    if (state.videoUrl) {
      URL.revokeObjectURL(state.videoUrl);
    }

    setState({
      isRecording: false,
      isPlaying: false,
      videoUrl: null,
      videoFile: null,
      duration: 0,
      error: null,
    });
  }, [state.videoUrl]);

  const handleFileSelect = useCallback((file: File) => {
    // Validate file type
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      setState(prev => ({
        ...prev,
        error: 'Please select a valid video file (MP4, WebM, or MOV)',
      }));
      return false;
    }

    // Validate file size
    if (file.size > MAX_VIDEO_SIZE) {
      setState(prev => ({
        ...prev,
        error: 'Video must be under 50MB',
      }));
      return false;
    }

    const url = URL.createObjectURL(file);
    
    // Validate duration
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      
      if (video.duration > MAX_VIDEO_DURATION) {
        setState(prev => ({
          ...prev,
          error: `Video must be under ${MAX_VIDEO_DURATION} seconds`,
        }));
        URL.revokeObjectURL(url);
        return;
      }

      setState({
        isRecording: false,
        isPlaying: false,
        videoUrl: url,
        videoFile: file,
        duration: Math.round(video.duration),
        error: null,
      });
    };
    video.src = URL.createObjectURL(file);

    return true;
  }, []);

  return {
    ...state,
    stream: streamRef.current,
    startRecording,
    stopRecording,
    clearVideo,
    handleFileSelect,
    maxDuration: MAX_VIDEO_DURATION,
  };
};

export const useUploadVideo = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/video-${Date.now()}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, {
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      // Update user's primary photo record to include video URL
      // First, get the primary photo or first photo
      const { data: photos } = await supabase
        .from('user_photos')
        .select('id')
        .eq('user_id', user.id)
        .order('display_order', { ascending: true })
        .limit(1);

      if (photos && photos.length > 0) {
        // Update existing photo with video URL using raw SQL via RPC
        // Since video_url is new, we update via a separate approach
        const { error: updateError } = await supabase
          .from('user_photos')
          .update({ storage_path: fileName } as never) // Store video path
          .eq('id', photos[0].id);

        if (updateError) throw updateError;
      } else {
        // Create a new photo entry with the video path
        const { error: insertError } = await supabase
          .from('user_photos')
          .insert({
            user_id: user.id,
            storage_path: fileName,
            display_order: 0,
            is_primary: true,
          });

        if (insertError) throw insertError;
      }

      return urlData.publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-photos'] });
      toast.success('Video uploaded successfully!');
    },
    onError: (error) => {
      console.error('Video upload failed:', error);
      toast.error('Failed to upload video');
    },
  });
};
