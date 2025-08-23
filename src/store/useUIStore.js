// src/store/useUIStore.js
import { create } from 'zustand';

const useUIStore = create(set => ({
  isChatOpen: false,
  toggleChat: () => set(state => ({ isChatOpen: !state.isChatOpen })),
}));

export default useUIStore;
