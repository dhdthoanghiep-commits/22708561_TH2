import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STUDENT } from '@constants/student';
import { toVnd, type Product } from '@services/productApi';

/** Một dòng trong giỏ */
export interface CartItem {
  id: string; // = String(product.id), cùng kiểu với route.params.id của Detail
  title: string;
  image: string;
  unitPrice: number; // VNĐ = Math.round(price * PRICE_MULTIPLIER)
  quantity: number;
}

interface CartState {
  items: CartItem[];
  distanceKm: number | null; // km tới cổng KTX, tab Tôi đo bằng GPS (null = chưa có vị trí)
  add: (product: Product) => void;
  remove: (id: string) => void;
  changeQty: (id: string, quantity: number) => void;
  clear: () => void;
  setDistanceKm: (km: number | null) => void;
  totalQuantity: () => number;
  totalAmount: () => number;
}

/**
 * Đám mây Giỏ hàng (Chương 6 – Bước 3 + Phần 6.9): Zustand + persist AsyncStorage.
 * Nút + ở Home và nút Thêm vào giỏ ở Detail cùng gọi add() của store này.
 */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      distanceKm: null,

      // Đã có trong giỏ -> chỉ tăng quantity; chưa có -> thêm dòng mới
      add: product => {
        const id = String(product.id);
        set(state => {
          const existing = state.items.find(item => item.id === id);
          if (existing) {
            return {
              items: state.items.map(item =>
                item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                id,
                title: product.title,
                image: product.image,
                unitPrice: toVnd(product.price),
                quantity: 1,
              },
            ],
          };
        });
      },

      remove: id =>
        set(state => ({ items: state.items.filter(item => item.id !== id) })),

      // Sửa số lượng; về 0 thì xoá dòng
      changeQty: (id, quantity) =>
        set(state => ({
          items:
            quantity <= 0
              ? state.items.filter(item => item.id !== id)
              : state.items.map(item =>
                  item.id === id ? { ...item, quantity } : item,
                ),
        })),

      clear: () => set({ items: [] }),

      setDistanceKm: km => set({ distanceKm: km }),

      // Tính "on-demand" bằng get() thay vì lưu thêm State thừa dễ lệch dữ liệu
      totalQuantity: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
      totalAmount: () =>
        get().items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    }),
    {
      name: `ktxgo-cart-${STUDENT.mssv}`, // Persist key giỏ có MSSV
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({ items: state.items }), // chỉ lưu items xuống ổ cứng
    },
  ),
);
