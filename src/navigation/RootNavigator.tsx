import React from 'react';
import AuthStack from '@navigation/AuthStack';
import MainTabs from '@navigation/MainTabs';
import { useAuthStore } from '@stores/authStore';

/**
 * Auth Flow State Machine (Chương 5 – Phần 5.2): 2 cây Navigator tách biệt theo token Zustand.
 * Chưa có token -> chỉ cấp AuthStack (Login); có token -> rút cây cũ, cấp MainTabs.
 * Đổi token => React unmount cây cũ, không thể bấm Back "lách" vào Main.
 */
const RootNavigator = () => {
  const token = useAuthStore(state => state.token);
  return token == null ? <AuthStack /> : <MainTabs />;
};

export default RootNavigator;
