import { Platform, Vibration } from 'react-native';
import { VARIANT } from '@constants/student';

/**
 * Trung tâm điều phối rung phản hồi của KTXGo (Chương 7 – Phần 7.6 + Sprint 7 Bước 3).
 * Dùng Vibration API có sẵn của React Native (phương án A của giáo trình — không cần hạ tầng
 * Expo Modules). App chỉ gọi hapticOnAdd(), không gọi Vibration rải rác: sau này đổi sang
 * expo-haptics (impactAsync / selectionAsync) chỉ sửa đúng file này.
 * Android cần khai báo <uses-permission android:name="android.permission.VIBRATE" />.
 */

let hapticsEnabled = true;

export const setHapticsEnabled = (value: boolean) => {
  hapticsEnabled = value;
};

/** Hàm rung lõi — nuốt mọi lỗi: tính năng phụ KHÔNG được làm sập app */
const safeVibrate = (pattern: number | number[]) => {
  if (!hapticsEnabled) {
    return;
  }
  try {
    Vibration.vibrate(pattern);
  } catch (e) {
    console.log('[haptics] Thiết bị không hỗ trợ rung:', e);
  }
};

/** "impact" — một cú chạm vừa, rõ (≈ Haptics.impactAsync(Medium)) */
export const hapticImpact = () => safeVibrate(Platform.OS === 'ios' ? 1 : 40);

/** "selection" — một nhịp "tích" rất ngắn (≈ Haptics.selectionAsync()) */
export const hapticSelection = () =>
  safeVibrate(Platform.OS === 'ios' ? 1 : 12);

/** Rung khi thêm vào giỏ — đọc VARIANT.hapticOnAdd ('impact' | 'selection') */
export const hapticOnAdd = () => {
  if (VARIANT.hapticOnAdd === 'impact') {
    hapticImpact();
  } else {
    hapticSelection();
  }
};
