// src/store/useUIStore.js
import { create } from 'zustand';

const useUIStore = create((set, get) => ({
  // 기존 상태들
  sidebarOpen: false,
  chatbotOpen: false,
  
  // 일정 업데이트 관련 상태
  shouldRefreshEvents: false,
  
  // 출석 업데이트 관련 상태
  shouldRefreshAttendance: false,
  shouldRefreshAttendanceStats: false, // 전체현황 통계 업데이트용
  
  // 액션들
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleChatbot: () => set((state) => ({ chatbotOpen: !state.chatbotOpen })),
  
  // 일정 업데이트 트리거
  triggerEventRefresh: () => set({ shouldRefreshEvents: true }),
  resetEventRefresh: () => set({ shouldRefreshEvents: false }),
  
  // 출석 업데이트 트리거
  triggerAttendanceRefresh: () => set({ shouldRefreshAttendance: true }),
  resetAttendanceRefresh: () => set({ shouldRefreshAttendance: false }),
  
  // 전체현황 통계 업데이트 트리거
  triggerAttendanceStatsRefresh: () => set({ shouldRefreshAttendanceStats: true }),
  resetAttendanceStatsRefresh: () => set({ shouldRefreshAttendanceStats: false }),
}));

export default useUIStore;
