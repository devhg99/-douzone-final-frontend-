// src/store/useUIStore.js
import { create } from 'zustand';

const useUIStore = create((set, get) => ({
  // 기존 상태들
  sidebarOpen: false,
  chatbotOpen: false,
  
  // 일정 업데이트 관련 상태
  shouldRefreshEvents: false,
  
  // 액션들
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleChatbot: () => set((state) => ({ chatbotOpen: !state.chatbotOpen })),
  
  // 일정 업데이트 트리거
  triggerEventRefresh: () => set({ shouldRefreshEvents: true }),
  resetEventRefresh: () => set({ shouldRefreshEvents: false }),
}));

export default useUIStore;
