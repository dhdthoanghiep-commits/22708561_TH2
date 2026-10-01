import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import KtxButton from '@components/KtxButton';
import ProductCard from '@components/ProductCard';
import Watermark from '@components/Watermark';
import {
  DEBOUNCE_MS,
  ROOM_LABEL,
  STALE_TIME_MS,
  STUDENT,
} from '@constants/student';
import { COLORS, SIZES } from '@constants/theme';
import { useDebouncedValue } from '@hooks/useDebouncedValue';
import {
  fetchProducts,
  PRODUCTS_QUERY_KEY,
  type Product,
} from '@services/productApi';
import { hapticOnAdd } from '@services/haptics';
import { useCartStore } from '@stores/cartStore';
import type { ShopStackParamList } from '@navigation/ShopStack';

type Props = NativeStackScreenProps<ShopStackParamList, 'Home'>;

/** Giao diện 2 — Tab Cửa hàng: Header (A) · Ô tìm debounce (B) · FlashList lưới 2 cột (C) */
const HomeScreen = ({ navigation }: Props) => {
  // (B) Ô tìm controlled: keyword đổi theo từng phím, nhưng LỌC theo bản đã debounce
  const [keyword, setKeyword] = useState('');
  const debouncedKeyword = useDebouncedValue(keyword, DEBOUNCE_MS);
  const add = useCartStore(state => state.add);

  // TanStack Query + Axios: đủ 3 cảnh pending / error / data (Chương 6 – Phần 6.5 mục 3)
  const { data, isPending, isError, error, refetch, isRefetching, isFetching } =
    useQuery({
      queryKey: PRODUCTS_QUERY_KEY,
      queryFn: fetchProducts,
      staleTime: STALE_TIME_MS,
    });

  const products = useMemo(() => {
    const kw = debouncedKeyword.trim().toLowerCase();
    if (!data) {
      return [];
    }
    if (!kw) {
      return data;
    }
    return data.filter(
      item =>
        item.title.toLowerCase().includes(kw) ||
        item.category.toLowerCase().includes(kw),
    );
  }, [data, debouncedKeyword]);

  // Bấm card -> Detail: chỉ gửi ID dạng string qua Route Params (Chương 5 – Phần 5.3)
  const openDetail = useCallback(
    (id: number) => navigation.navigate('Detail', { id: String(id) }),
    [navigation],
  );

  // Bấm + -> thêm vào giỏ Zustand + Haptic đúng VARIANT.hapticOnAdd
  const handleAdd = useCallback(
    (product: Product) => {
      add(product);
      hapticOnAdd();
    },
    [add],
  );

  const isTyping = keyword !== debouncedKeyword;

  const renderBody = () => {
    // Cảnh 1 — Đang tải (lần đầu, chưa có Cache)
    if (isPending) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải món...</Text>
        </View>
      );
    }

    // Cảnh 3 — Lỗi mạng: có MSSV + nút Thử lại (refetch)
    if (isError) {
      return (
        <View style={styles.center}>
          <Text style={styles.errorMssv}>{STUDENT.mssv}</Text>
          <Text style={styles.errorTitle}>Không tải được dữ liệu món.</Text>
          <Text style={styles.errorDetail}>{error?.message}</Text>
          <KtxButton
            title="Thử lại"
            variant="danger"
            isLoading={isFetching}
            onPress={() => refetch()}
            style={styles.retryBtn}
          />
        </View>
      );
    }

    // Cảnh 2 — Có dữ liệu: FlashList lưới 2 cột (KHÔNG bọc trong ScrollView dọc)
    return (
      <FlashList
        data={products}
        numColumns={2}
        // FlashList v2: đã gỡ prop estimatedItemSize (chỉ bắt buộc ở v1), tự đo kích thước ô
        keyExtractor={item => `${STUDENT.mssv}-${item.id}`}
        renderItem={({ item }) => (
          <ProductCard product={item} onPress={openDetail} onAdd={handleAdd} />
        )}
        // Pull-to-refresh = refetch() của React Query (thay setTimeout giả lập ở Chương 4)
        refreshing={isRefetching}
        onRefresh={refetch}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Không có món khớp “{debouncedKeyword}”
          </Text>
        }
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Watermark position="top" />

      {/* (A) Header KTXGO + Giao tận {ROOM_LABEL} */}
      <View style={styles.header}>
        <Text style={styles.brand}>KTXGO</Text>
        <Text style={styles.room}>Giao tận {ROOM_LABEL}</Text>
      </View>

      {/* (B) Ô tìm controlled — lọc theo chuỗi đã debounce DEBOUNCE_MS */}
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          value={keyword}
          onChangeText={setKeyword}
          placeholder={`Tìm món (debounce) — ${STUDENT.mssv}`}
          placeholderTextColor={COLORS.textLight}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
        <Text style={styles.searchHint}>
          {isTyping
            ? `Đang gõ… lọc sau ${DEBOUNCE_MS}ms`
            : `(C) FlashList ×2 · ${products.length} món`}
        </Text>
      </View>

      <View style={styles.body}>{renderBody()}</View>

      <Watermark position="bottom" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding,
    paddingVertical: 14,
  },
  brand: {
    color: COLORS.surface,
    fontSize: SIZES.h1,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  room: { color: COLORS.border, fontSize: SIZES.body2, marginTop: 2 },
  searchWrap: {
    paddingHorizontal: SIZES.padding,
    paddingTop: 12,
    paddingBottom: 4,
  },
  searchInput: {
    height: 46,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 23,
    paddingHorizontal: SIZES.padding,
    backgroundColor: COLORS.surface,
    fontSize: SIZES.body1,
    color: COLORS.text,
  },
  searchHint: {
    alignSelf: 'flex-end',
    marginTop: 6,
    fontSize: SIZES.small,
    fontWeight: '700',
    color: COLORS.primary,
  },
  body: { flex: 1 },
  listContent: { paddingHorizontal: 10, paddingBottom: 12 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding * 2,
  },
  loadingText: {
    marginTop: 12,
    fontSize: SIZES.body1,
    fontWeight: '700',
    color: COLORS.text,
  },
  errorMssv: {
    fontSize: SIZES.h3,
    fontWeight: '800',
    color: COLORS.error,
  },
  errorTitle: {
    marginTop: 4,
    fontSize: SIZES.body1,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  errorDetail: {
    marginTop: 4,
    fontSize: SIZES.small,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  retryBtn: { marginTop: 18, alignSelf: 'stretch' },
  emptyText: {
    marginTop: 40,
    textAlign: 'center',
    color: COLORS.textLight,
    fontSize: SIZES.body1,
  },
});

export default HomeScreen;
