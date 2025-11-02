export const USER_LOGIN_SUCCESS = 'USER_LOGIN_SUCCESS';
export const USER_LOGOUT_SUCCESS = 'USER_LOGOUT_SUCCESS';
export const USER_REFRESH_TOKEN = 'USER_REFRESH_TOKEN';
export const doLogin = (data)=>{
    return {
        type: USER_LOGIN_SUCCESS,
        payload: data
    }
}

export const doLogout = ()=>{
    return {
        type: USER_LOGOUT_SUCCESS
    }
}

export const updateAccessToken = (access_token) => {
  return {
    type: USER_REFRESH_TOKEN,
    payload: access_token,
  };
};
