import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface IUser {
    id: Number
}

interface IUserData {
    token: String | null,
    user: IUser | null
}

const initialState: IUserData = {
    token: localStorage.getItem("token") || null,
    user: null
}

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setToken: (state, action: PayloadAction<string>) => {
            const token = action.payload;
            if (!token)
                return;
            state.token = token;
            localStorage.setItem("token", token)
        },
        resetToken: (state) => {
            state.token = null;
            localStorage.removeItem("token")
        },
        setUser: (state, action: PayloadAction<IUser>) => {
            state.user = action.payload;
        },
        resetUser: (state) => {
            state.user = null;
        }
    }
})

export const { setToken, setUser, resetUser, resetToken } = userSlice.actions
export default userSlice.reducer;