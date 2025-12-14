import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StreamingServiceData, STREAMING_SERVICES } from '../types/streaming';

interface StreamingStore {
  selectedServices: string[];
  showAllMovies: boolean;
  hasCompletedOnboarding: boolean;
  
  toggleService: (serviceId: string) => void;
  setSelectedServices: (serviceIds: string[]) => void;
  setShowAllMovies: (show: boolean) => void;
  getSelectedProviderIds: () => number[];
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

const useStreamingStore = create<StreamingStore>()(
  persist(
    (set, get) => ({
      selectedServices: [],
      showAllMovies: false,
      hasCompletedOnboarding: false,
      
      toggleService: (serviceId) => {
        set((state) => {
          const isSelected = state.selectedServices.includes(serviceId);
          if (isSelected) {
            return {
              selectedServices: state.selectedServices.filter(id => id !== serviceId),
              showAllMovies: false,
            };
          } else {
            return {
              selectedServices: [...state.selectedServices, serviceId],
              showAllMovies: false,
            };
          }
        });
      },
      
      setSelectedServices: (serviceIds) => {
        set({
          selectedServices: serviceIds,
          showAllMovies: false,
        });
      },
      
      setShowAllMovies: (show) => {
        set({
          showAllMovies: show,
          selectedServices: show ? [] : get().selectedServices,
        });
      },
      
      getSelectedProviderIds: () => {
        const { selectedServices, showAllMovies } = get();
        
        if (showAllMovies) {
          return [];
        }
        
        return selectedServices
          .map(id => STREAMING_SERVICES.find(s => s.id === id)?.providerId)
          .filter((id): id is number => id !== undefined);
      },
      
      completeOnboarding: () => {
        set({ hasCompletedOnboarding: true });
      },
      
      resetOnboarding: () => {
        set({
          hasCompletedOnboarding: false,
          selectedServices: [],
          showAllMovies: false,
        });
      },
    }),
    {
      name: '3wt-streaming-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useStreamingStore;