import { create } from 'zustand';

const useUserStore = create(set => ({
  isLoggedIn: false,
  user: null,
  login: user => set({ isLoggedIn: true, user }),
  logout: () => set({ isLoggedIn: false, user: null }),
}));

export default useUserStore;
