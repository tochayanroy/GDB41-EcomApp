import { createSlice } from '@reduxjs/toolkit'


const userSlice = createSlice({
    name: 'user',
    initialState: {
        isLogin: false,
        role: ''
    },
    reducers: {
        setLogin: (state, action) => {
            state.isLogin = true,
            state.role = action.payload.role
        },
        setLogout: (state) => {
            state.isLogin = false,
            state.role = ''
        },
    }
})

export const {setLogin, setLogout} = userSlice.actions;
export default userSlice.reducer;