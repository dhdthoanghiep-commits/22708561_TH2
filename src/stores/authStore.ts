import { create } from 'zustand';

interface AuthState {
  token: string | null; // token giả: ktxgo-{mssv}-{stamp}
  account: string | null; // email hoặc số điện thoại đã nhập (theo VARIANT.authField)
  login: (token: string, account: string) => void;
  logout: () => void;
}

/**
 * Đám mây Auth (Chương 6 – Bước 2). Chưa có token -> RootNavigator chỉ cấp AuthStack.
 * KHÔNG persist token bằng AsyncStorage (Phần 6.9: AsyncStorage lưu clear-text).
 */
export const useAuthStore = create<AuthState>(set => ({
  token: null,
  account: null,
  login: (token, account) => set({ token, account }),
  logout: () => set({ token: null, account: null }),
}));
