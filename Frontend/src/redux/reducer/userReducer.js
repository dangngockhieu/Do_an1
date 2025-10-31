import { USER_LOGIN_SUCCESS,
        USER_LOGOUT_SUCCESS
        } from "../action/userAction";

const INITIAL_STATE = {
    account: {
        id: '',
        access_token: '',
        name: '',
        role: '',
        email: ''
    },
    isAuthenticated: false
};

const userReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case USER_LOGIN_SUCCESS:
            return {
                ...state, account: {
                    id: action?.payload?.DT?.user?.id,
                    access_token: action?.payload?.DT?.access_token,
                    name: action?.payload?.DT?.user?.name,
                    role: action?.payload?.DT?.user?.role,
                    email: action?.payload?.DT?.user?.email
                },
                isAuthenticated: true
            };
        case USER_LOGOUT_SUCCESS:
            return {
                ...state,
                account: {
                    id: '',
                    access_token: '',
                    name: '',
                    role: '',
                    email: ''
                },
                isAuthenticated: false
            };
        default: return state;
    }
};

export default userReducer;
