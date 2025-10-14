import { createSlice } from '@reduxjs/toolkit'


const watchListSlice = createSlice({
    name: 'watchlist',
    initialState: {
        items: []
    },
    reducers: {
        addTowatchlistData: (state, action) => {
            state.items.push(action.payload)
        },
        removeTowatchlistData: (state) => {
            state.items = state.items.filter(item => item.id !== action.payload.id)
        },
        clearwatchlist: (state) => {
            state.items = []
        },
    }
})

export const { addTowatchlistData, removeTowatchlistData, clearwatchlist } = watchListSlice.actions;
export default watchListSlice.reducer;