import { SET_CART_COUNT, INCREMENT_CART, DECREMENT_CART, RESET_CART } from "../action/cartAction";

const INITIAL_STATE = {
  count: 0,
};

const cartReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case SET_CART_COUNT:
      return { ...state, count: action.payload };
    case INCREMENT_CART:
      return { ...state, count: state.count + 1 };
    case DECREMENT_CART:
      return { ...state, count: Math.max(0, state.count - 1) };
    case RESET_CART:
      return { ...state, count: 0 };
    default:
      return state;
  }
};

export default cartReducer;
