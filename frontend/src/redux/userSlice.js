import { createSlice } from '@reduxjs/toolkit';
import jwtDecode from 'jwt-decode';

const safeParse = (key) => {
    try {
        return JSON.parse(localStorage.getItem(key));
    } catch (e) {
        return null;
    }
};

// Drop broken cart entries (for example items saved without a price)
const cleanCart = (cart) => (Array.isArray(cart) ? cart.filter((item) => item && item.price) : []);

const storedUser = safeParse('user');
if (storedUser && storedUser.role === "Customer") {
    storedUser.cartDetails = cleanCart(storedUser.cartDetails);
}

const initialState = {
    status: 'idle',
    loading: false,
    currentUser: storedUser || null,
    currentRole: (storedUser || {}).role || null,
    currentToken: (storedUser || {}).token || null,
    isLoggedIn: false,
    error: null,
    response: null,

    responseReview: null,
    responseProducts: null,
    responseSellerProducts: null,
    responseSpecificProducts: null,
    responseDetails: null,
    responseSearch: null,
    responseCustomersList: null,

    productData: [],
    sellerProductData: [],
    specificProductData: [],
    productDetails: {},
    productDetailsCart: {},
    filteredProducts: [],
    customersList: [],
    guestCart: cleanCart(safeParse('guestCart')),
};

const updateCartDetailsInLocalStorage = (cartDetails) => {
    const currentUser = safeParse('user') || {};
    currentUser.cartDetails = cartDetails;
    localStorage.setItem('user', JSON.stringify(currentUser));
};

export const updateShippingDataInLocalStorage = (shippingData) => {
    const currentUser = safeParse('user') || {};
    const updatedUser = {
        ...currentUser,
        shippingData: shippingData
    };
    localStorage.setItem('user', JSON.stringify(updatedUser));
};

// Logged-in customers use their own cart, guests use guestCart
const getCart = (state) => {
    if (state.currentUser) {
        if (!Array.isArray(state.currentUser.cartDetails)) {
            state.currentUser.cartDetails = [];
        }
        return state.currentUser.cartDetails;
    }
    return state.guestCart;
};

const saveCart = (state) => {
    if (state.currentUser) {
        updateCartDetailsInLocalStorage(state.currentUser.cartDetails);
    } else {
        try {
            localStorage.setItem('guestCart', JSON.stringify(state.guestCart));
        } catch (e) { /* ignore */ }
    }
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        authRequest: (state) => {
            state.status = 'loading';
        },
        underControl: (state) => {
            state.status = 'idle';
            state.response = null;
        },
        stuffAdded: (state) => {
            state.status = 'added';
            state.response = null;
            state.error = null;
        },
        stuffUpdated: (state) => {
            state.status = 'updated';
            state.response = null;
            state.error = null;
        },
        updateFailed: (state, action) => {
            state.status = 'failed';
            state.responseReview = action.payload;
            state.error = null;
        },
        updateCurrentUser: (state, action) => {
            state.currentUser = action.payload;
            localStorage.setItem('user', JSON.stringify(action.payload));
        },
        authSuccess: (state, action) => {
            const user = JSON.parse(JSON.stringify(action.payload));

            if (user.role === "Customer") {
                user.cartDetails = cleanCart(user.cartDetails);

                // Merge the guest cart into the customer's cart on login/signup
                if (state.guestCart.length > 0) {
                    const guestItems = JSON.parse(JSON.stringify(state.guestCart));

                    guestItems.forEach((item) => {
                        const existing = user.cartDetails.find((c) => c._id === item._id);
                        if (existing) {
                            existing.quantity += item.quantity;
                        } else {
                            user.cartDetails.push(item);
                        }
                    });

                    state.guestCart = [];
                    localStorage.removeItem('guestCart');
                }
            }

            localStorage.setItem('user', JSON.stringify(user));
            state.currentUser = user;
            state.currentRole = user.role;
            state.currentToken = user.token;
            state.status = 'success';
            state.response = null;
            state.error = null;
            state.isLoggedIn = true;
        },
        addToCart: (state, action) => {
            // Never add a product that has no price
            if (!action.payload || !action.payload.price) return;

            const cart = getCart(state);
            const existingProduct = cart.find((item) => item._id === action.payload._id);

            if (existingProduct) {
                existingProduct.quantity += 1;
            } else {
                cart.push({ ...action.payload, quantity: 1 });
            }
            saveCart(state);
        },
        removeFromCart: (state, action) => {
            const cart = getCart(state);
            const index = cart.findIndex((item) => item._id === action.payload._id);

            if (index !== -1) {
                if (cart[index].quantity > 1) {
                    cart[index].quantity -= 1;
                } else {
                    cart.splice(index, 1);
                }
            }
            saveCart(state);
        },

        removeSpecificProduct: (state, action) => {
            const remaining = getCart(state).filter((item) => item._id !== action.payload);
            if (state.currentUser) {
                state.currentUser.cartDetails = remaining;
            } else {
                state.guestCart = remaining;
            }
            saveCart(state);
        },

        fetchProductDetailsFromCart: (state, action) => {
            const productInCart = getCart(state).find((item) => item._id === action.payload);
            state.productDetailsCart = productInCart ? { ...productInCart } : null;
        },

        removeAllFromCart: (state) => {
            if (state.currentUser) {
                state.currentUser.cartDetails = [];
            } else {
                state.guestCart = [];
            }
            saveCart(state);
        },

        authFailed: (state, action) => {
            state.status = 'failed';
            state.response = action.payload;
            state.error = null;
        },
        authError: (state, action) => {
            state.status = 'error';
            state.response = null;
            state.error = action.payload;
        },
        authLogout: (state) => {
            localStorage.removeItem('user');
            state.status = 'idle';
            state.loading = false;
            state.currentUser = null;
            state.currentRole = null;
            state.currentToken = null;
            state.error = null;
            state.response = true;
            state.isLoggedIn = false;
        },

        isTokenValid: (state) => {
            let valid = false;

            try {
                if (state.currentToken) {
                    const decodedToken = jwtDecode(state.currentToken);
                    valid = decodedToken.exp * 1000 > Date.now();
                }
            } catch (e) {
                valid = false;
            }

            if (valid) {
                state.isLoggedIn = true;
            } else {
                localStorage.removeItem('user');
                state.currentUser = null;
                state.currentRole = null;
                state.currentToken = null;
                state.status = 'idle';
                state.response = null;
                state.error = null;
                state.isLoggedIn = false;
            }
        },

        getRequest: (state) => {
            state.loading = true;
        },
        getFailed: (state, action) => {
            state.response = action.payload;
            state.loading = false;
            state.error = null;
        },
        getError: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        getDeleteSuccess: (state) => {
            state.status = 'deleted';
            state.loading = false;
            state.error = null;
            state.response = null;
        },

        productSuccess: (state, action) => {
            state.productData = action.payload;
            state.responseProducts = null;
            state.loading = false;
            state.error = null;
        },
        getProductsFailed: (state, action) => {
            state.responseProducts = action.payload;
            state.loading = false;
            state.error = null;
        },

        sellerProductSuccess: (state, action) => {
            state.sellerProductData = action.payload;
            state.responseSellerProducts = null;
            state.loading = false;
            state.error = null;
        },
        getSellerProductsFailed: (state, action) => {
            state.responseSellerProducts = action.payload;
            state.loading = false;
            state.error = null;
        },

        specificProductSuccess: (state, action) => {
            state.specificProductData = action.payload;
            state.responseSpecificProducts = null;
            state.loading = false;
            state.error = null;
        },
        getSpecificProductsFailed: (state, action) => {
            state.responseSpecificProducts = action.payload;
            state.loading = false;
            state.error = null;
        },

        productDetailsSuccess: (state, action) => {
            state.productDetails = action.payload;
            state.responseDetails = null;
            state.loading = false;
            state.error = null;
        },
        getProductDetailsFailed: (state, action) => {
            state.responseDetails = action.payload;
            state.loading = false;
            state.error = null;
        },

        customersListSuccess: (state, action) => {
            state.customersList = action.payload;
            state.responseCustomersList = null;
            state.loading = false;
            state.error = null;
        },

        getCustomersListFailed: (state, action) => {
            state.responseCustomersList = action.payload;
            state.loading = false;
            state.error = null;
        },

        setFilteredProducts: (state, action) => {
            state.filteredProducts = action.payload;
            state.responseSearch = null;
            state.loading = false;
            state.error = null;
        },
        getSearchFailed: (state, action) => {
            state.responseSearch = action.payload;
            state.loading = false;
            state.error = null;
        },
    },
});

export const {
    authRequest,
    underControl,
    stuffAdded,
    stuffUpdated,
    updateFailed,
    authSuccess,
    authFailed,
    authError,
    authLogout,
    isTokenValid,
    doneSuccess,
    getDeleteSuccess,
    getRequest,
    productSuccess,
    sellerProductSuccess,
    productDetailsSuccess,
    getProductsFailed,
    getSellerProductsFailed,
    getProductDetailsFailed,
    getFailed,
    getError,
    getSearchFailed,
    setFilteredProducts,
    getCustomersListFailed,
    customersListSuccess,
    getSpecificProductsFailed,
    specificProductSuccess,

    addToCart,
    removeFromCart,
    removeSpecificProduct,
    removeAllFromCart,
    fetchProductDetailsFromCart,
    updateCurrentUser,
} = userSlice.actions;

export const userReducer = userSlice.reducer;