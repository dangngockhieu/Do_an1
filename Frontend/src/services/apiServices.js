import axios from '../utils/axiosCustomize';
//admin

export const getAllUsersforAdmin = () => {
  const URL_BACKEND = 'user/get-all-users';
  return axios.get(URL_BACKEND);
}
export const getUserWithPaginate = (page, limit, search = "") => {
  const URL_BACKEND = `user/get-users-paginate?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`;
  return axios.get(URL_BACKEND);
};

export const findUserPage = (search = "", limit = 10) => {
  const URL_BACKEND = `user/find-user-page?search=${encodeURIComponent(search)}&limit=${limit}`;
  return axios.get(URL_BACKEND);
};

export const createUserforAdmin = (email, name, password, role) => {
  const URL_BACKEND = 'user/create-user';
  const data = { email, name, password, role };
  return axios.post(URL_BACKEND, data );
};

export const changeRoleUserforAdmin = (id, role) => {
  const URL_BACKEND = `user/update-role-user/${id}`;
  return axios.patch(URL_BACKEND, { role });
};

export const deleteUserforAdmin = (id) => {
  const URL_BACKEND = `user/delete-user/${id}`;
  return axios.delete(URL_BACKEND);
};
// for all users
export const register = (email, name, password) => {
  const URL_BACKEND = 'auth/register';
  const data = { email, name, password };
  return axios.post(URL_BACKEND, data );
};

export const login = (email, password) => {
  const URL_BACKEND = 'auth/login';
  const data = { email, password };
  return axios.post(URL_BACKEND, data, { withCredentials: true });
};

export const logout = () =>{
  const URL_BACKEND = 'auth/logout';
  return axios.post(URL_BACKEND, {}, { withCredentials: true });
}


export const sendResetPassword = (email) => {
  const URL_BACKEND = 'auth/send-reset-password';
  const data = { email };
  return axios.post(URL_BACKEND, data );
}

export const resetPassword = (email, code, newPassword) => {
  const URL_BACKEND = 'auth/reset-password';
  const data = { email, code, newPassword };
  return axios.post(URL_BACKEND, data);
}

export const changePassword = (oldPassword, newPassword) => {
  const URL_BACKEND = 'user/change-password';
  const data = { oldPassword, newPassword };
  return axios.patch(URL_BACKEND, data);
}

