import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import KtxButton from '@components/KtxButton';
import Watermark from '@components/Watermark';
import {
  BASE_SHIP_FEE,
  ROOM_LABEL,
  STUDENT,
  VARIANT,
  examStamp,
} from '@constants/student';
import { COLORS, SIZES } from '@constants/theme';
import {
  useCampusLocation,
  type LocationPermission,
} from '@hooks/useCampusLocation';
import { formatVnd } from '@services/productApi';
import { useAuthStore } from '@stores/authStore';

const PERMISSION_LABEL: Record<LocationPermission, string> = {
  undetermined: 'chưa hỏi',
  granted: 'granted',
  denied: 'denied',
  blocked: 'blocked',
};

/** Giao diện 4 (phải) — Tab Tôi: 3 nhánh quyền Location + Haversine + phí A/B + Đăng xuất */
const MeScreen = () => {
  const logout = useAuthStore(state => state.logout);
  const account = useAuthStore(state => state.account);
  const { permission, loading, error, distanceKm, shipFee, locate, openSettings } =
    useCampusLocation();

  const permissionStyle =
    permission === 'granted'
      ? styles.granted
      : permission === 'blocked'
      ? styles.blocked
      : permission === 'denied'
      ? styles.denied
      : styles.undetermined;

  const formulaText =
    VARIANT.shipFormula === 'A'
      ? `A: ${formatVnd(BASE_SHIP_FEE)} + km × 2.000`
      : `B: ${formatVnd(BASE_SHIP_FEE)} + km × 1.500 + 2.000`;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Watermark position="top" />
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>TÔI · LOCATION</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.name}>{STUDENT.hoTen}</Text>
        <Text style={styles.meta}>
          {STUDENT.mssv} · #{examStamp()}
        </Text>
        {account ? (
          <Text style={styles.account}>
            {VARIANT.authField === 'email' ? 'Email' : 'SĐT'}: {account} ·
            Phòng {ROOM_LABEL}
          </Text>
        ) : null}

        <View style={styles.card}>
          <Text style={[styles.permission, permissionStyle]}>
            Quyền: {PERMISSION_LABEL[permission]}
          </Text>
          {loading ? (
            <View style={styles.row}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.line}> Đang xác định vị trí...</Text>
            </View>
          ) : (
            <Text style={styles.line}>
              {distanceKm == null
                ? 'Chưa có vị trí'
                : `≈ ${distanceKm.toFixed(1)} km tới cổng KTX`}
            </Text>
          )}
          <Text style={styles.feeLabel}>Phí ship ước tính</Text>
          <Text style={styles.fee}>
            {shipFee == null ? '—' : formatVnd(shipFee)}
          </Text>
          <Text style={styles.formula}>Công thức {formulaText}</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>

        <KtxButton
          title="Lấy vị trí ước tính ship"
          onPress={locate}
          isLoading={loading}
          style={styles.btn}
        />
        <KtxButton
          title="Mở Cài đặt (blocked)"
          variant="outline"
          onPress={openSettings}
          style={styles.btn}
        />
        <KtxButton
          title="Đăng xuất"
          variant="danger"
          onPress={logout}
          style={styles.btn}
        />
      </ScrollView>

      <Watermark position="bottom" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  headerBar: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    alignItems: 'center',
  },
  headerTitle: {
    color: COLORS.surface,
    fontSize: SIZES.h3,
    fontWeight: '900',
    letterSpacing: 1,
  },
  container: { padding: SIZES.padding, paddingBottom: 28 },
  name: {
    textAlign: 'center',
    fontSize: SIZES.h2,
    fontWeight: '900',
    color: COLORS.text,
  },
  meta: {
    marginTop: 2,
    textAlign: 'center',
    fontSize: SIZES.body1,
    color: COLORS.textLight,
  },
  account: {
    marginTop: 2,
    textAlign: 'center',
    fontSize: SIZES.body2,
    color: COLORS.textLight,
  },
  card: {
    marginTop: 16,
    marginBottom: 6,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.surface,
  },
  permission: { fontSize: SIZES.body1, fontWeight: '800' },
  granted: { color: COLORS.success },
  denied: { color: COLORS.secondary },
  blocked: { color: COLORS.error },
  undetermined: { color: COLORS.textLight },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  line: { marginTop: 6, fontSize: SIZES.body1, color: COLORS.text },
  feeLabel: { marginTop: 10, fontSize: SIZES.body2, color: COLORS.textLight },
  fee: {
    marginTop: 2,
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.secondary,
  },
  formula: { marginTop: 4, fontSize: SIZES.small, color: COLORS.textLight },
  error: { marginTop: 8, fontSize: SIZES.body2, color: COLORS.error },
  btn: { marginTop: 12 },
});

export default MeScreen;
