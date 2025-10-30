import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  balance: Record<string, number>;
}

const initialState: UserState = {
  balance: { KRW: 1000000, USD: 500, JPY: 50000 },
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout: (state) => {
      // 로그아웃 시 balance 초기화
      state.balance = { KRW: 1000000, USD: 500, JPY: 50000 };
      localStorage.removeItem('token');
    },
    updateBalance: (state, action: PayloadAction<Record<string, number>>) => {
      state.balance = action.payload;
    },
  },
});

export const { logout, updateBalance } = userSlice.actions;
export default userSlice.reducer;
