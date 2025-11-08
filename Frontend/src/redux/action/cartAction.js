export const SET_CART_COUNT = "SET_CART_COUNT";
export const INCREMENT_CART = "INCREMENT_CART";
export const DECREMENT_CART = "DECREMENT_CART";
export const RESET_CART = "RESET_CART";

export const setCartCount = (count) => ({
  type: SET_CART_COUNT,
  payload: count,
});

export const incrementCart = () => ({
  type: INCREMENT_CART,
});

export const decrementCart = () => ({
  type: DECREMENT_CART,
});

export const resetCart = () => ({
  type: RESET_CART,
});
