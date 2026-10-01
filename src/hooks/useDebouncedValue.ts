import { useEffect, useState } from 'react';

/**
 * Custom Hook Debounce (Chương 4 – Phần 4.6 mục 2: kỹ thuật Debounce Search).
 * Chỉ trả về giá trị mới khi người dùng NGỪNG gõ đủ `delay` ms.
 * Dùng: useDebouncedValue(keyword, DEBOUNCE_MS) — delay lấy từ student.ts, không gõ tay.
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Gõ thêm ký tự trước khi hết hạn -> huỷ hẹn cũ, đếm lại từ đầu
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export default useDebouncedValue;
