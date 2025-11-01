import instance from './axiosCustomize';
import { store } from '../redux/store';
import { doLogin } from '../redux/action/userAction';
import { toast } from "react-toastify";

export const restoreToken = async () => {
  try {
    const res = await instance.post('auth/refresh-token', {}, { withCredentials: true });
    if (res?.EC === 0 && res?.DT) {
      store.dispatch(doLogin({ DT: res.DT }));
    }
  } catch (err) {
    toast.error('Không thể khôi phục phiên đăng nhập, người dùng chưa đăng nhập hoặc refresh_token đã hết hạn.');
  }
};
