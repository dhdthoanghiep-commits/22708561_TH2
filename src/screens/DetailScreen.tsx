import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import KtxButton from '@components/KtxButton';
import Watermark from '@components/Watermark';
import { getTint } from '@components/ProductCard';
import { ROOM_LABEL, STALE_TIME_MS, STUDENT } from '@constants/student';
import { COLORS, SIZES } from '@constants/theme';
import {
  fetchProducts,
  formatPrice,
  PRODUCTS_QUERY_KEY,
} from '@services/productApi';
import { hapticOnAdd } from '@services/haptics';
import { useCartStore } from '@stores/cartStore';
import type { ShopStackParamList } from '@navigation/ShopStack';

type Props = NativeStackScreenProps<ShopStackParamList, 'Detail'>;

/** Giao diện 3 — Chi tiết món (Stack push từ Home), nhận route.params.id */
const DetailScreen = ({ route }: Props) => {
  const { id } = route.params; // chỉ nhận đúng 1 chuỗi ID, không nhận cả object
  const add = useCartStore(state => state.add);

  // Dùng CHUNG queryKey với Home -> đọc lại Cache (không gọi API lần 2 khi còn tươi)
  const {
    data: product,
    isPending,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: PRODUCTS_QUERY_KEY,
    queryFn: fetchProducts,
    staleTime: STALE_TIME_MS,
    select: list => list.find(item => String(item.id) === id),
  });

  const handleAdd = () => {
    if (!product) {
      return;
    }
    add(product); // cùng store với nút + ở Home
    hapticOnAdd(); // Haptic đúng VARIANT
    Alert.alert(
      'Đã thêm vào giỏ',
      `MSSV ${STUDENT.mssv} · ${product.title}\nGiao tận ${ROOM_LABEL}`,
    );
  };

  let content: React.ReactNode;
  if (isPending) {
    content = (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.stateText}>Đang tải món #{id}...</Text>
      </View>
    );
  } else if (isError || !product) {
    content = (
      <View style={styles.center}>
        <Text style={styles.errorMssv}>{STUDENT.mssv}</Text>
        <Text style={styles.stateText}>Không tìm thấy món có id = {id}</Text>
        <KtxButton
          title="Thử lại"
          variant="danger"
          isLoading={isFetching}
          onPress={() => refetch()}
          style={styles.retryBtn}
        />
      </View>
    );
  } else {
    content = (
      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.imageBox, getTint(product.id)]}>
          <Image
            source={{ uri: product.image }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.title}>{product.title}</Text>
        <Text style={styles.price}>{formatPrice(product.price)}</Text>
        <Text style={styles.sub}>
          Giao nội khu · nhận tận phòng {ROOM_LABEL}
        </Text>
        <Text style={styles.desc} numberOfLines={3}>
          {product.description}
        </Text>
        <Text style={styles.idNote}>
          route.params.id = {id} · {product.category}
        </Text>
        <KtxButton
          title="Thêm vào giỏ"
          onPress={handleAdd}
          style={styles.addBtn}
        />
      </ScrollView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <Watermark position="top" />
      <View style={styles.body}>{content}</View>
      <Watermark position="bottom" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  body: { flex: 1 },
  container: { padding: SIZES.padding, paddingBottom: 32 },
  imageBox: {
    height: 220,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: { width: '70%', height: '86%' },
  title: {
    marginTop: 16,
    fontSize: SIZES.h2,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },
  price: {
    marginTop: 6,
    fontSize: SIZES.h2,
    fontWeight: '900',
    color: COLORS.primary,
    textAlign: 'center',
  },
  sub: {
    marginTop: 6,
    fontSize: SIZES.body2,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  desc: {
    marginTop: 18,
    fontSize: SIZES.body1,
    lineHeight: 22,
    color: COLORS.textLight,
  },
  idNote: {
    marginTop: 8,
    fontSize: SIZES.small,
    color: COLORS.textLight,
  },
  addBtn: { marginTop: 24 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding * 2,
  },
  stateText: {
    marginTop: 10,
    fontSize: SIZES.body1,
    color: COLORS.text,
    textAlign: 'center',
  },
  errorMssv: { fontSize: SIZES.h3, fontWeight: '800', color: COLORS.error },
  retryBtn: { marginTop: 16, alignSelf: 'stretch' },
});

export default DetailScreen;
