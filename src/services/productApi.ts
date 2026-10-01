import apiClient from '@services/apiClient';
import { PRICE_MULTIPLIER, STUDENT } from '@constants/student';

/** 1 món trả về từ https://fakestoreapi.com/products */
export interface Product {
  id: number;
  title: string;
  price: number; // giá gốc của API -> đổi sang VNĐ bằng PRICE_MULTIPLIER
  description: string;
  category: string;
  image: string;
}

/**
 * Mã định danh Cache của TanStack Query. Home và Detail dùng CHUNG key này
 * nên Detail đọc lại đúng Cache Home đã tải (không gọi API lần 2 khi dữ liệu còn tươi).
 */
export const PRODUCTS_QUERY_KEY = ['ktxgo-products', STUDENT.mssv] as const;

/** GET https://fakestoreapi.com/products?limit=12 qua Axios instance (có interceptor X-Student-Id) */
export async function fetchProducts(): Promise<Product[]> {
  const res = await apiClient.get<Product[]>('/products?limit=12');

  // Không tin tuyệt đối Backend (Chương 6 – Phần 6.7): dữ liệu sai khuôn -> ném lỗi cho nhánh error
  if (!Array.isArray(res.data)) {
    throw new Error('Dữ liệu món trả về không hợp lệ');
  }
  return res.data.filter(
    item =>
      typeof item?.id === 'number' &&
      typeof item?.title === 'string' &&
      typeof item?.price === 'number',
  );
}

/** Giá VNĐ của 1 món: Math.round(price * PRICE_MULTIPLIER) — không gõ cứng giá */
export const toVnd = (price: number): number =>
  Math.round(price * PRICE_MULTIPLIER);

/** Định dạng tiền: toLocaleString('vi-VN') + ' đ' */
export const formatVnd = (amount: number): string =>
  amount.toLocaleString('vi-VN') + ' đ';

/** Giá hiển thị trên Card / Detail */
export const formatPrice = (price: number): string =>
  Math.round(price * PRICE_MULTIPLIER).toLocaleString('vi-VN') + ' đ';
