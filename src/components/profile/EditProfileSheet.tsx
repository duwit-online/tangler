import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, Loader2, MapPin, User, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProfile, useUpdateProfile, useUserPhotos, useUploadPhoto, useDeletePhoto, getPhotoUrl } from "@/hooks/useProfile";
import ImageCropper from "@/components/profile/ImageCropper";
import { toast } from "sonner";

interface EditProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AVAILABLE_INTERESTS = [
  "Travel", "Photography", "Music", "Cooking", "Fitness", 
  "Reading", "Gaming", "Art", "Movies", "Dancing",
  "Hiking", "Yoga", "Coffee", "Wine", "Sports",
  "Technology", "Fashion", "Nature", "Pets", "Volunteering"
];

const EditProfileSheet = ({ open, onOpenChange }: EditProfileSheetProps) => {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: photos = [] } = useUserPhotos();
  const updateProfile = useUpdateProfile();
  const uploadPhoto = useUploadPhoto();
  const deletePhoto = useDeletePhoto();

  const [formData, setFormData] = useState({
    display_name: "",
    bio: "",
    age: "",
    gender: "",
    looking_for: "",
    location: "",
    interests: [] as string[],
  });

  const [cropImage, setCropImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || "",
        bio: profile.bio || "",
        age: profile.age?.toString() || "",
        gender: profile.gender || "",
        looking_for: profile.looking_for || "",
        location: profile.location || "",
        interests: profile.interests || [],
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile.mutateAsync({
        display_name: formData.display_name,
        bio: formData.bio,
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender,
        looking_for: formData.looking_for,
        location: formData.location,
        interests: formData.interests,
      });
      toast.success("Profile updated!");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCropImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = async (blob: Blob) => {
    const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
    try {
      await uploadPhoto.mutateAsync({ file, isPrimary: photos.length === 0 });
      toast.success("Photo uploaded!");
    } catch (error) {
      toast.error("Failed to upload photo");
    }
    setCropImage(null);
  };

  const handleDeletePhoto = async (photoId: string) => {
    try {
      await deletePhoto.mutateAsync(photoId);
      toast.success("Photo deleted");
    } catch (error) {
      toast.error("Failed to delete photo");
    }
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest].slice(0, 8)
    }));
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-lg font-serif">Edit Profile</SheetTitle>
          </SheetHeader>

          {profileLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Photos Section */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Photos</Label>
                <div className="grid grid-cols-3 gap-2">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden group">
                      <img
                        src={getPhotoUrl(photo.storage_path)}
                        alt="Profile photo"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="absolute top-1 right-1 w-6 h-6 bg-destructive/80 rounded-full flex items-center justify-center text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      {photo.is_primary && (
                        <div className="absolute bottom-1 left-1 bg-primary/80 text-primary-foreground text-[10px] px-1.5 py-0.5 rounded">
                          Main
                        </div>
                      )}
                    </div>
                  ))}
                  {photos.length < 6 && (
                    <label className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                      <Camera className="w-6 h-6 text-muted-foreground mb-1" />
                      <span className="text-xs text-muted-foreground">Add</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm">Display Name</Label>
                  <Input
                    id="name"
                    value={formData.display_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                    placeholder="Your name"
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="age" className="text-sm">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                      placeholder="25"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Gender</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="non-binary">Non-binary</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-sm">Looking For</Label>
                  <Select
                    value={formData.looking_for}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, looking_for: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Men</SelectItem>
                      <SelectItem value="female">Women</SelectItem>
                      <SelectItem value="everyone">Everyone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="location" className="text-sm">Location</Label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="City, Country"
                      className="pl-9"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio" className="text-sm">About Me</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Write something about yourself..."
                    className="mt-1 resize-none"
                    rows={3}
                  />
                </div>
              </div>

              {/* Interests */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Interests ({formData.interests.length}/8)
                </Label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_INTERESTS.map((interest) => (
                    <Badge
                      key={interest}
                      variant={formData.interests.includes(interest) ? "default" : "outline"}
                      className={`cursor-pointer transition-colors ${
                        formData.interests.includes(interest) 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-secondary"
                      }`}
                      onClick={() => toggleInterest(interest)}
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full gradient-primary text-primary-foreground"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {cropImage && (
        <ImageCropper
          image={cropImage}
          onComplete={handleCropComplete}
          onCancel={() => setCropImage(null)}
        />
      )}
    </>
  );
};

export default EditProfileSheet;
