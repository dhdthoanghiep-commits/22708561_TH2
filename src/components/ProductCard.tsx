import React, { memo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { CARD_TINTS, COLORS, SIZES } from '@constants/theme';
import { formatPrice, type Product } from '@services/productApi';

interface Props {
  product: Product;
  onPress: (id: number) => void; // bấm card -> Detail
  onAdd: (product: Product) => void; // bấm + -> thêm giỏ + Haptic
}

/** Nền pastel cố định theo id món (StyleSheet, không style inline) */
export const tintStyles = StyleSheet.create({
  t0: { backgroundColor: CARD_TINTS[0] },
  t1: { backgroundColor: CARD_TINTS[1] },
  t2: { backgroundColor: CARD_TINTS[2] },
  t3: { backgroundColor: CARD_TINTS[3] },
});
export const getTint = (id: number) =>
  [tintStyles.t0, tintStyles.t1, tintStyles.t2, tintStyles.t3][
    Math.abs(id) % CARD_TINTS.length
  ];

/** Thẻ món trong lưới 2 cột (Chương 4 – Bước 3: ProductCard tách file + memo) */
const ProductCard = ({ product, onPress, onAdd }: Props) => {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() => onPress(product.id)}
      accessibilityRole="button"
      accessibilityLabel={`Xem chi tiết ${product.title}`}>
      <View style={[styles.thumb, getTint(product.id)]}>
        <Image
          source={{ uri: product.image }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {product.title}
      </Text>

      <View style={styles.footer}>
        <Text style={styles.price} numberOfLines={1}>
          {formatPrice(product.price)}
        </Text>
        {/* Nút + nằm TRONG card: tự bắt touch trước, không bị Pressable ngoài "cướp" */}
        <Pressable
          style={({ pressed }) => [styles.addBtn, pressed && styles.addPressed]}
          onPress={() => onAdd(product)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Thêm ${product.title} vào giỏ`}>
          <Text style={styles.addText}>+</Text>
        </Pressable>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1, // tự giãn đủ bề rộng 1 cột của FlashList numColumns={2}
    margin: 6,
    padding: 10,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  pressed: { opacity: 0.85 },
  thumb: {
    height: 104,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: { width: '70%', height: '84%' },
  title: {
    marginTop: 10,
    fontSize: SIZES.body2,
    fontWeight: '700',
    color: COLORS.text,
    minHeight: 36, // cố định 2 dòng -> các card cùng hàng cao bằng nhau, lưới ổn định
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  price: {
    flex: 1,
    fontSize: SIZES.body2,
    fontWeight: '800',
    color: COLORS.primary,
    marginRight: 6,
  },
  addBtn: {
    width: 36,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPressed: { opacity: 0.7 },
  addText: {
    color: COLORS.surface,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 22,
  },
});

export default memo(ProductCard);
