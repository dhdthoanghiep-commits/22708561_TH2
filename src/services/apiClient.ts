import axios from 'axios';
import { STUDENT } from '@constants/student';
import { useAuthStore } from '@stores/authStore';

/**
 * Axios Instance dùng chung cho cả app (Chương 6 – Phần 6.6 mục 1):
 * baseURL/timeout/header mặc định chỉ khai báo ĐÚNG 1 nơi.
 */
const apiClient = axios.create({
  baseURL: 'https://fakestoreapi.com',
  timeout: 10000, // quá 10 giây -> báo lỗi Timeout (rơi vào nhánh error của useQuery)
  headers: { 'Content-Type': 'application/json' },
});

// REQUEST INTERCEPTOR (Phần 6.6 mục 2): chạy TRƯỚC mọi request
apiClient.interceptors.request.use(config => {
  // Đề TH2: mọi request phải gắn X-Student-Id = MSSV
  config.headers['X-Student-Id'] = STUDENT.mssv;

  // Gắn token giả từ Zustand (đọc ngoài Component bằng getState())
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// RESPONSE INTERCEPTOR: bắt lỗi 401 tập trung một chỗ -> đăng xuất về Login
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error?.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);

export default apiClient;
