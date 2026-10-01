// src/constants/theme.ts — Bảng màu KTXGo theo đề TH2 (Chương 3: theme.ts là tầng thấp nhất,
// chỉ chứa hằng số thuần). Bộ màu xanh dương riêng của KTXGo, không dùng lại màu ShopAI / CampusMart TH1.
export const COLORS = {
  primary: '#1D4ED8', // nút, tab chọn, giá
  secondary: '#F97316', // badge giỏ, phí ship
  background: '#EFF6FF', // nền sáng
  surface: '#FFFFFF', // card
  text: '#1E3A8A',
  textLight: '#64748B',
  border: '#BFDBFE',
  error: '#DC2626',
  success: '#16A34A',
} as const;

/** Nền pastel cho khung ảnh món (bố cục Giao diện 2) — chọn theo id món */
export const CARD_TINTS = ['#FEF3C7', '#E0F2FE', '#DCFCE7', '#FEE2E2'] as const;

export const SIZES = {
  base: 8,
  radius: 14,
  padding: 16,
  h1: 28,
  h2: 20,
  h3: 17,
  body1: 15,
  body2: 13,
  small: 11,
} as const;

/** Map cỡ chữ (Chương 3 – Bước 1: COLORS + SIZES + FONTS) */
export const FONTS = {
  h1: { fontSize: SIZES.h1, fontWeight: '800' as const },
  h2: { fontSize: SIZES.h2, fontWeight: '700' as const },
  h3: { fontSize: SIZES.h3, fontWeight: '700' as const },
  body1: { fontSize: SIZES.body1, fontWeight: '400' as const },
  body2: { fontSize: SIZES.body2, fontWeight: '400' as const },
  small: { fontSize: SIZES.small, fontWeight: '600' as const },
};
