import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
}

interface UseGeolocationReturn extends GeolocationState {
  requestPermission: () => Promise<boolean>;
  calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => number;
  updateUserLocation: () => Promise<void>;
}

// Haversine formula to calculate distance between two coordinates in miles
const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

export const useGeolocation = (): UseGeolocationReturn => {
  const { user } = useAuth();
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: false,
  });

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!("geolocation" in navigator)) {
      setState((prev) => ({ ...prev, error: "Geolocation is not supported" }));
      return false;
    }

    setState((prev) => ({ ...prev, loading: true }));

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setState({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            error: null,
            loading: false,
          });
          resolve(true);
        },
        (error) => {
          let errorMessage = "Unable to get location";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location permission denied";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out";
              break;
          }
          setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
          resolve(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // Cache for 5 minutes
        }
      );
    });
  }, []);

  const updateUserLocation = useCallback(async () => {
    if (!user?.id || !state.latitude || !state.longitude) return;

    try {
      await supabase
        .from("profiles")
        .update({
          latitude: state.latitude,
          longitude: state.longitude,
        })
        .eq("user_id", user.id);
    } catch (error) {
      console.error("Failed to update user location:", error);
    }
  }, [user?.id, state.latitude, state.longitude]);

  // Auto-update location in database when it changes
  useEffect(() => {
    if (state.latitude && state.longitude && user?.id) {
      updateUserLocation();
    }
  }, [state.latitude, state.longitude, user?.id, updateUserLocation]);

  // Request location on mount
  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  return {
    ...state,
    requestPermission,
    calculateDistance: haversineDistance,
    updateUserLocation,
  };
};

// Hook to get real distance to a profile
export const useProfileDistance = (
  targetLat: number | null | undefined,
  targetLon: number | null | undefined
): number | null => {
  const { latitude, longitude, calculateDistance } = useGeolocation();

  if (!latitude || !longitude || !targetLat || !targetLon) {
    return null;
  }

  return calculateDistance(latitude, longitude, targetLat, targetLon);
};
