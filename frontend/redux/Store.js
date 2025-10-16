import { configureStore } from "@reduxjs/toolkit";
import cartReducer from './slice/cartSlice';
import userReducer from './slice/userSlice';
import watchlistReducer from './slice/watchListSlice';

const Store = configureStore({
    reducer: {
        cart: cartReducer,
        user: userReducer,
        watchlist: watchlistReducer
    }
})

export default Store;