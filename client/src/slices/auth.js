import { createSlice } from "@reduxjs/toolkit";

import { authThunks } from "../thunks/auth";

const user = JSON.parse(localStorage.getItem("user"));

const initialState = user
  ? { isLoggedIn: true, user }
  : { isLoggedIn: false, user: null };

const authSlice = createSlice({
  name: "auth",
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(authThunks.register.fulfilled, (state) => {
        state.isLoggedIn = false;
      })
      .addCase(authThunks.register.rejected, (state) => {
        state.isLoggedIn = false;
      })
      .addCase(authThunks.login.fulfilled, (state, action) => {
        state.isLoggedIn = true;
        state.user = action.payload.user;
      })
      .addCase(authThunks.login.rejected, (state) => {
        state.isLoggedIn = false;
        state.user = null;
      })
      .addCase(authThunks.logout.fulfilled, (state) => {
        state.isLoggedIn = false;
        state.user = null;
      });
  },
});

const { reducer } = authSlice;
export default reducer;
