import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  AppState,
  Linking,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {
  BASE_SHIP_FEE,
  ROOM_LABEL,
  STUDENT,
  VARIANT,
} from '@constants/student';
import { useCartStore } from '@stores/cartStore';

/** Trạng thái quyền Location (Chương 7 – Phần 7.5): chưa hỏi | granted | denied | blocked */
export type LocationPermission = 'undetermined' | 'granted' | 'denied' | 'blocked';

/** Toạ độ cổng KTX cố định trong code (cổng KTX IUH – 12 Nguyễn Văn Bảo, Gò Vấp) */
export const KTX_GATE = {
  latitude: 10.822158,
  longitude: 106.686824,
} as const;

/** Haversine: khoảng cách đường chim bay (km) giữa 2 toạ độ (Chương 7 – Sprint 7 Bước 7) */
export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // bán kính Trái Đất (km)
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Phí ship theo VARIANT.shipFormula — BASE_SHIP_FEE lấy từ student.ts (không gõ cứng phí cuối):
 *  A: BASE_SHIP_FEE + Math.round(km * 2000)
 *  B: BASE_SHIP_FEE + Math.round(km * 1500) + 2000
 */
export function calcShipFee(km: number): number {
  if (VARIANT.shipFormula === 'A') {
    return BASE_SHIP_FEE + Math.round(km * 2000);
  }
  return BASE_SHIP_FEE + Math.round(km * 1500) + 2000;
}

const GPS_ERRORS: Record<number, string> = {
  1: 'Bạn đã từ chối quyền vị trí',
  2: 'Không bắt được tín hiệu GPS (máy ảo: bơm toạ độ ở Extended controls > Location)',
  3: 'Quá thời gian chờ GPS, thử lại',
};

/** CHỈ ĐỌC quyền hiện tại — KHÔNG bung pop-up (dùng khi mount và khi AppState 'active') */
async function readPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return false; // iOS: không có API đọc riêng, chỉ biết sau khi requestAuthorization
  }
  return PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );
}

/** XIN quyền (có pop-up) -> trả về đúng 1 trong 3 nhánh granted / denied / blocked */
async function requestPermission(): Promise<LocationPermission> {
  if (Platform.OS === 'ios') {
    // iOS chỉ hỏi ĐÚNG 1 lần: đã từ chối = blocked, chỉ còn đường vào Cài đặt
    return new Promise(resolve => {
      Geolocation.requestAuthorization(
        () => resolve('granted'),
        () => resolve('blocked'),
      );
    });
  }

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: 'KTXGo cần quyền vị trí',
      message: `KTXGo dùng vị trí để ước tính phí ship tới phòng ${ROOM_LABEL} (MSSV ${STUDENT.mssv}).`,
      buttonPositive: 'Cho phép',
      buttonNegative: 'Để sau',
    },
  );

  // PermissionsAndroid trả 'granted' | 'denied' | 'never_ask_again'
  if (result === PermissionsAndroid.RESULTS.GRANTED) {
    return 'granted';
  }
  if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
    return 'blocked';
  }
  return 'denied';
}

/**
 * useCampusLocation — bọc quyền Location + GPS + Haversine + phí ship thành 1 hook
 * (Chương 7 – Sprint 7 Bước 8, mẫu "lớp bọc mỏng"). Khoảng cách lưu vào cartStore
 * để tab Giỏ cũng thấy phí ship khi đã có vị trí.
 */
export function useCampusLocation() {
  const [permission, setPermission] = useState<LocationPermission>('undetermined');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const permissionRef = useRef<LocationPermission>('undetermined');
  const distanceKm = useCartStore(state => state.distanceKm);
  const setDistanceKm = useCartStore(state => state.setDistanceKm);

  const updatePermission = useCallback((next: LocationPermission) => {
    permissionRef.current = next;
    setPermission(next);
  }, []);

  /** Lấy toạ độ 1 lần -> Haversine tới cổng KTX -> lưu km vào store */
  const getPosition = useCallback(() => {
    setLoading(true);
    setError(null);
    Geolocation.getCurrentPosition(
      position => {
        const km = haversineKm(
          position.coords.latitude,
          position.coords.longitude,
          KTX_GATE.latitude,
          KTX_GATE.longitude,
        );
        setDistanceKm(km);
        setLoading(false);
      },
      err => {
        setError(GPS_ERRORS[err.code] ?? 'Không lấy được vị trí');
        setLoading(false);
      },
      // BẮT BUỘC có timeout (Phần 7.7) — ước tính phí ship chỉ cần độ chính xác vài trăm mét
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 },
    );
  }, [setDistanceKm]);

  /** Nút "Lấy vị trí ước tính ship": xin quyền đúng lúc cần (Just-in-time permission) */
  const locate = useCallback(async () => {
    setError(null);
    const status = await requestPermission();
    updatePermission(status);

    if (status === 'granted') {
      getPosition();
      return;
    }

    setDistanceKm(null);
    if (status === 'blocked') {
      setError('Quyền vị trí đã bị chặn — bấm "Mở Cài đặt" để bật lại.');
      Alert.alert(
        'Quyền vị trí đã bị chặn',
        'Bạn đã chọn "Không hỏi lại". Vào Cài đặt > KTXGo > Quyền > Vị trí để bật lại.',
        [
          { text: 'Để sau', style: 'cancel' },
          { text: 'Mở Cài đặt', onPress: () => Linking.openSettings() },
        ],
      );
    } else {
      setError('Bạn vừa từ chối quyền vị trí — bấm lại để xin lần nữa.');
    }
  }, [getPosition, setDistanceKm, updatePermission]);

  /** blocked -> mở thẳng trang Cài đặt của chính app (Phần 7.5 mục 3) */
  const openSettings = useCallback(() => {
    Linking.openSettings();
  }, []);

  /** Dò lại quyền (CHỈ ĐỌC) — tránh vòng lặp pop-up khi gắn vào AppState */
  const syncPermission = useCallback(async () => {
    const granted = await readPermission();
    const prev = permissionRef.current;
    if (granted) {
      updatePermission('granted');
      if (prev !== 'granted') {
        getPosition(); // vừa có quyền (lần đầu mở tab / vừa bật lại trong Cài đặt)
      }
    } else if (prev === 'granted') {
      updatePermission('denied'); // user thu hồi quyền trong Cài đặt
      setDistanceKm(null);
    }
  }, [getPosition, setDistanceKm, updatePermission]);

  useEffect(() => {
    syncPermission();
    // Quay về từ Cài đặt -> app 'active' -> dò lại quyền (Phần 7.5)
    const sub = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        syncPermission();
      }
    });
    return () => sub.remove();
  }, [syncPermission]);

  const shipFee = distanceKm == null ? null : calcShipFee(distanceKm);

  return {
    permission,
    loading,
    error,
    distanceKm,
    shipFee,
    locate,
    openSettings,
  };
}

export default useCampusLocation;
