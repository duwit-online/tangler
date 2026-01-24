import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft, 
  Camera, 
  Plus, 
  X, 
  Loader2,
  Heart,
  Check,
  Video
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateProfile, useUploadPhoto, useUserPhotos, getPhotoUrl, useDeletePhoto } from '@/hooks/useProfile';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import VideoRecorder from '@/components/onboarding/VideoRecorder';

const INTERESTS = [
  'Travel', 'Music', 'Movies', 'Books', 'Fitness', 'Cooking',
  'Art', 'Photography', 'Gaming', 'Sports', 'Dancing', 'Nature',
  'Coffee', 'Wine', 'Yoga', 'Hiking', 'Beach', 'Camping',
  'Fashion', 'Tech', 'Foodie', 'Pets', 'Comedy', 'Theater'
];

const GENDERS = ['Man', 'Woman', 'Non-binary'];
const LOOKING_FOR = ['Man', 'Woman', 'Everyone'];

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [lookingFor, setLookingFor] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const updateProfile = useUpdateProfile();
  const uploadPhoto = useUploadPhoto();
  const deletePhoto = useDeletePhoto();
  const { data: photos = [] } = useUserPhotos();

  const steps = [
    { title: 'Add Photos', subtitle: 'Show your best self' },
    { title: 'Video Intro', subtitle: 'Record a short introduction (optional)' },
    { title: 'About You', subtitle: 'Tell us who you are' },
    { title: 'Your Bio', subtitle: 'Write something interesting' },
    { title: 'Interests', subtitle: 'Pick at least 3' },
  ];

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (photos.length >= 6) {
      toast.error('Maximum 6 photos allowed');
      return;
    }

    setUploading(true);
    try {
      await uploadPhoto.mutateAsync({ file, isPrimary: photos.length === 0 });
      toast.success('Photo uploaded!');
    } catch (error) {
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    try {
      await deletePhoto.mutateAsync(photoId);
      toast.success('Photo removed');
    } catch (error) {
      toast.error('Failed to remove photo');
    }
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const canProceed = () => {
    switch (step) {
      case 0: return photos.length >= 1;
      case 1: return true; // Video is optional
      case 2: return displayName.trim() && age && parseInt(age) >= 18 && gender && lookingFor;
      case 3: return bio.trim().length >= 20;
      case 4: return selectedInterests.length >= 3;
      default: return false;
    }
  };

  const handleComplete = async () => {
    try {
      await updateProfile.mutateAsync({
        display_name: displayName,
        age: parseInt(age),
        gender,
        looking_for: lookingFor,
        bio,
        location: location || null,
        interests: selectedInterests,
        onboarding_completed: true,
      });
      toast.success('Profile complete! Start discovering matches.');
      navigate('/');
    } catch (error) {
      toast.error('Failed to save profile');
    }
  };

  return (
    <div className="min-h-screen gradient-warm">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-md">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            {step > 0 ? (
              <button 
                onClick={() => setStep(step - 1)}
                className="p-2 -ml-2 text-foreground"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            ) : (
              <div className="w-10" />
            )}
            <span className="text-sm text-muted-foreground">
              Step {step + 1} of {steps.length}
            </span>
            <div className="w-10" />
          </div>
          
          {/* Progress bar */}
          <div className="flex gap-1">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  idx <= step ? 'gradient-primary' : 'bg-secondary'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-28 pb-32 px-4 max-w-md mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-serif font-bold text-foreground mb-2">
                {steps[step].title}
              </h1>
              <p className="text-muted-foreground">
                {steps[step].subtitle}
              </p>
            </div>

            {/* Step 0: Photos */}
            {step === 0 && (
              <div className="grid grid-cols-3 gap-3">
                {[...Array(6)].map((_, idx) => {
                  const photo = photos[idx];
                  return (
                    <div
                      key={idx}
                      className="aspect-[3/4] rounded-xl overflow-hidden relative"
                    >
                      {photo ? (
                        <>
                          <img
                            src={getPhotoUrl(photo.storage_path)}
                            alt={`Photo ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => handleDeletePhoto(photo.id)}
                            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-destructive flex items-center justify-center text-destructive-foreground"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          {idx === 0 && (
                            <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                              Main
                            </div>
                          )}
                        </>
                      ) : (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="w-full h-full border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
                        >
                          {uploading ? (
                            <Loader2 className="w-8 h-8 animate-spin" />
                          ) : (
                            <>
                              <Plus className="w-8 h-8 mb-1" />
                              <span className="text-xs">Add</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Step 1: Video Introduction */}
            {step === 1 && (
              <div className="space-y-4">
                <VideoRecorder
                  onVideoUploaded={setVideoUrl}
                  existingVideoUrl={videoUrl}
                />
                <p className="text-center text-sm text-muted-foreground">
                  Video introductions help you stand out and get more matches!
                </p>
              </div>
            )}

            {/* Step 2: Basic Info */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    First Name
                  </label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your first name"
                    className="h-12 rounded-xl bg-card border-border"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Age
                  </label>
                  <Input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Your age"
                    min="18"
                    max="100"
                    className="h-12 rounded-xl bg-card border-border"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    I am a
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {GENDERS.map((g) => (
                      <button
                        key={g}
                        onClick={() => setGender(g)}
                        className={`py-3 rounded-xl font-medium transition-all ${
                          gender === g
                            ? 'gradient-primary text-primary-foreground'
                            : 'bg-card border border-border text-foreground'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Looking for
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {LOOKING_FOR.map((l) => (
                      <button
                        key={l}
                        onClick={() => setLookingFor(l)}
                        className={`py-3 rounded-xl font-medium transition-all ${
                          lookingFor === l
                            ? 'gradient-primary text-primary-foreground'
                            : 'bg-card border border-border text-foreground'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Location (optional)
                  </label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, Country"
                    className="h-12 rounded-xl bg-card border-border"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Bio */}
            {step === 3 && (
              <div className="space-y-4">
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Write something interesting about yourself..."
                  className="min-h-[200px] rounded-xl bg-card border-border resize-none"
                  maxLength={500}
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Minimum 20 characters</span>
                  <span>{bio.length}/500</span>
                </div>
              </div>
            )}

            {/* Step 4: Interests */}
            {step === 4 && (
              <div>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((interest) => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`px-4 py-2 rounded-full font-medium transition-all ${
                        selectedInterests.includes(interest)
                          ? 'gradient-primary text-primary-foreground'
                          : 'bg-card border border-border text-foreground hover:border-primary'
                      }`}
                    >
                      {selectedInterests.includes(interest) && (
                        <Check className="w-4 h-4 inline mr-1" />
                      )}
                      {interest}
                    </button>
                  ))}
                </div>
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Selected: {selectedInterests.length}/3 minimum
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          className="hidden"
        />
      </div>

      {/* Bottom button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md">
        <div className="max-w-md mx-auto">
          <Button
            onClick={() => {
              if (step < steps.length - 1) {
                setStep(step + 1);
              } else {
                handleComplete();
              }
            }}
            disabled={!canProceed() || updateProfile.isPending}
            className="w-full h-14 rounded-xl gradient-primary text-primary-foreground font-semibold text-lg"
          >
            {updateProfile.isPending ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : step < steps.length - 1 ? (
              <>
                Continue
                <ChevronRight className="w-5 h-5 ml-1" />
              </>
            ) : (
              <>
                <Heart className="w-5 h-5 mr-2" />
                Start Matching
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
