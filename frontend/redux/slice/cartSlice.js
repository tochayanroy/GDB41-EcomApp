import { createSlice } from '@reduxjs/toolkit'


const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        items: []
    },
    reducers: {
        addToCartData: (state, action) => {
            state.items.push(action.payload)
        },
        removeToCartData: (state) => {
            state.items = state.items.filter(item => item.id !== action.payload.id)
        },
        clearCart: (state) => {
            state.items = []
        },
    }
})

export const { addToCartData, removeToCartData, clearCart } = cartSlice.actions;
export default cartSlice.reducer;