import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cấu hình URL Backend của bạn (hỗ trợ biến môi trường EXPO_PUBLIC_API_URL nếu có)
const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  'https://chamcong-backend-8pgb.onrender.com';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tự động gắn Token vào mỗi request (Interceptor)
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Xử lý lỗi chung (Ví dụ: Hết hạn token thì đá ra login)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Logic logout hoặc refresh token có thể đặt ở đây
      console.log('Token hết hạn hoặc không hợp lệ');
    }
    return Promise.reject(error);
  }
);

export default api;