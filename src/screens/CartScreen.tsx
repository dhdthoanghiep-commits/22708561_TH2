import React, { useCallback } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import KtxButton from '@components/KtxButton';
import Watermark from '@components/Watermark';
import { ROOM_LABEL, STUDENT, VARIANT } from '@constants/student';
import { COLORS, SIZES } from '@constants/theme';
import { calcShipFee } from '@hooks/useCampusLocation';
import { formatVnd } from '@services/productApi';
import { useCartStore, type CartItem } from '@stores/cartStore';
import type { MainTabParamList } from '@navigation/MainTabs';

type Props = BottomTabScreenProps<MainTabParamList, 'CartTab'>;

/** Giao diện 4 (trái) — Tab Giỏ: sửa SL, xoá, tổng tiền, ROOM_LABEL, phí ship (nếu đã có vị trí) */
const CartScreen = ({ navigation }: Props) => {
  const items = useCartStore(state => state.items);
  const changeQty = useCartStore(state => state.changeQty);
  const remove = useCartStore(state => state.remove);
  const totalAmount = useCartStore(state => state.totalAmount());
  const totalQuantity = useCartStore(state => state.totalQuantity());
  const distanceKm = useCartStore(state => state.distanceKm);

  // Phí ship phản ánh từ tab Tôi (km đã đo bằng GPS) — tính bằng công thức A/B theo VARIANT
  const shipFee = distanceKm == null ? null : calcShipFee(distanceKm);

  const renderItem = useCallback(
    ({ item }: { item: CartItem }) => (
      <View style={styles.itemCard}>
        <Image
          source={{ uri: item.image }}
          style={styles.itemImage}
          resizeMode="contain"
        />
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.itemMeta}>
            ×{item.quantity} {'  '}
            {formatVnd(item.unitPrice * item.quantity)}
          </Text>
          <View style={styles.qtyRow}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => changeQty(item.id, item.quantity - 1)}
              accessibilityLabel={`Giảm số lượng ${item.title}`}>
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{item.quantity}</Text>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => changeQty(item.id, item.quantity + 1)}
              accessibilityLabel={`Tăng số lượng ${item.title}`}>
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
            <Text style={styles.unitPrice}>
              {formatVnd(item.unitPrice)} / món
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => remove(item.id)}
          accessibilityLabel={`Xoá ${item.title} khỏi giỏ`}>
          <Icon name="trash-can-outline" size={20} color={COLORS.surface} />
        </TouchableOpacity>
      </View>
    ),
    [changeQty, remove],
  );

  const footer = (
    <View>
      <View style={styles.shipBox}>
        <Text style={styles.shipRoom}>Giao đến {ROOM_LABEL}</Text>
        {shipFee == null ? (
          <Text style={styles.shipPending}>
            Phí ship: chưa có vị trí — mở tab Tôi để ước tính
          </Text>
        ) : (
          <Text style={styles.shipFee}>
            Phí ship: {formatVnd(shipFee)} (công thức {VARIANT.shipFormula})
          </Text>
        )}
      </View>
      <Text style={styles.total}>Tổng hàng: {formatVnd(totalAmount)}</Text>
      {shipFee != null ? (
        <Text style={styles.grandTotal}>
          Tạm tính kèm ship: {formatVnd(totalAmount + shipFee)}
        </Text>
      ) : null}
      <Text style={styles.count}>
        {totalQuantity} món · giỏ lưu theo key ktxgo-cart-{STUDENT.mssv}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Watermark position="top" />
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>GIỎ HÀNG</Text>
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Icon name="cart-off" size={56} color={COLORS.border} />
          <Text style={styles.emptyText}>Giỏ đang trống</Text>
          <KtxButton
            title="Về Cửa hàng"
            onPress={() => navigation.navigate('ShopTab', { screen: 'Home' })}
            style={styles.emptyBtn}
          />
          {footer}
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => `${STUDENT.mssv}-${item.id}`}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListFooterComponent={footer}
        />
      )}

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
  list: { padding: SIZES.padding, paddingBottom: 24 },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: 12,
    marginBottom: 10,
  },
  itemImage: { width: 48, height: 48, marginRight: 10 },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: SIZES.body1, fontWeight: '700', color: COLORS.text },
  itemMeta: { marginTop: 2, fontSize: SIZES.body2, color: COLORS.textLight },
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 18,
  },
  qtyValue: {
    minWidth: 28,
    textAlign: 'center',
    fontSize: SIZES.body1,
    fontWeight: '800',
    color: COLORS.text,
  },
  unitPrice: { marginLeft: 8, fontSize: SIZES.small, color: COLORS.textLight },
  deleteBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  shipBox: {
    marginTop: 4,
    padding: 14,
    borderRadius: SIZES.radius,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.surface,
  },
  shipRoom: { fontSize: SIZES.body1, fontWeight: '800', color: COLORS.text },
  shipFee: {
    marginTop: 4,
    fontSize: SIZES.body1,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  shipPending: { marginTop: 4, fontSize: SIZES.body2, color: COLORS.secondary },
  total: {
    marginTop: 14,
    textAlign: 'center',
    fontSize: SIZES.h3,
    fontWeight: '900',
    color: COLORS.primary,
  },
  grandTotal: {
    marginTop: 4,
    textAlign: 'center',
    fontSize: SIZES.body2,
    fontWeight: '700',
    color: COLORS.text,
  },
  count: {
    marginTop: 6,
    textAlign: 'center',
    fontSize: SIZES.small,
    color: COLORS.textLight,
  },
  empty: { flex: 1, padding: SIZES.padding, justifyContent: 'center' },
  emptyText: {
    marginTop: 8,
    marginBottom: 16,
    textAlign: 'center',
    fontSize: SIZES.body1,
    color: COLORS.textLight,
  },
  emptyBtn: { marginBottom: 20 },
});

export default CartScreen;
