import axios from 'axios';
import NProgress from 'nprogress';
import { store } from '../redux/store';
import { doLogin, doLogout } from '../redux/action/userAction';
import { toast } from 'react-toastify';

// ================== CẤU HÌNH NProgress ==================
NProgress.configure({
  showSpinner: false,
  trickleSpeed: 100,
  minimum: 0.1,
});

// ================== KHỞI TẠO INSTANCE ==================
const instance = axios.create({
  baseURL: 'http://localhost:8080/'
});

// ================== QUẢN LÝ REFRESH TOKEN ==================
let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (newAccessToken) => {
  refreshSubscribers.forEach((callback) => callback(newAccessToken));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

// ================== REQUEST INTERCEPTOR ==================
instance.interceptors.request.use(
  (config) => {
    const access_token = store?.getState()?.user?.account?.access_token;
    if (access_token) {
      config.headers['Authorization'] = 'Bearer ' + access_token;
    }
    NProgress.start();
    return config;
  },
  (error) => {
    NProgress.done();
    return Promise.reject(error);
  }
);

// ================== RESPONSE INTERCEPTOR ==================
instance.interceptors.response.use(
  (response) => {
    NProgress.done();
    return response?.data ?? response;
  },

  async (error) => {
    NProgress.done();

    const originalRequest = error.config;

    // Kiểm tra nếu lỗi không có response (server chết, network lỗi)
    if (!error.response) {
      toast.error('Không thể kết nối đến máy chủ!');
      return Promise.reject(error);
    }

    // ================== XỬ LÝ LỖI 401 (TOKEN HẾT HẠN) ==================
    if (
      error?.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('auth/refresh-token')
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Nếu đang refresh, các request khác sẽ chờ
        return new Promise((resolve) => {
          addRefreshSubscriber((newAccessToken) => {
            originalRequest.headers['Authorization'] =
              'Bearer ' + newAccessToken;
            resolve(instance(originalRequest));
          });
        });
      }

      isRefreshing = true;
      console.log('[Axios] Đang làm mới access token...');

      try {
        // Gọi API refresh token (refresh_token nằm trong cookie)
        const res = await instance.post('auth/refresh-token', {}, { withCredentials: true });
        if (res?.EC === 0 && res?.DT) {
          const { access_token: newAccess, user } = res.DT;

          store.dispatch(
            doLogin({
              DT: {
                access_token: newAccess,
                user,
              },
            })
          );

          onRefreshed(newAccess);
          console.log('[Axios] Refresh token thành công.');

          originalRequest.headers['Authorization'] = 'Bearer ' + newAccess;
          return instance(originalRequest);
        } else {
          throw new Error('Invalid refresh response');
        }
      } catch (err) {
        console.error('[Axios] Làm mới token thất bại:', err);
        toast.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!');
        store.dispatch(doLogout());
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    // ================== XỬ LÝ LỖI 403 ==================
    if (error?.response?.status === 403) {
      toast.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!');
      store.dispatch(doLogout());
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // ================== TRẢ VỀ LỖI MẶC ĐỊNH ==================
    return error?.response?.data || Promise.reject(error);
  }
);

export default instance;
