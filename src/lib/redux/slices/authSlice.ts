import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { isAxiosError } from "axios";
import {
  registerRequest,
  loginRequest,
  refreshRequest,
  logoutRequest,
  RegisterPayload,
  LoginPayload,
} from "@/lib/api/authApi";
import axiosInstance from "@/lib/api/axiosInstance";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
  initialized: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  status: "idle",
  initialized: false,
  error: null,
};

function extractErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err) && err.response?.data?.message) {
    return err.response.data.message as string;
  }
  return fallback;
}

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (payload: RegisterPayload, { rejectWithValue }) => {
    try {
      return await registerRequest(payload);
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err, "Registration failed"));
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      return await loginRequest(payload);
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err, "Invalid credentials"));
    }
  }
);

export const refreshSession = createAsyncThunk(
  "auth/refreshSession",
  async (_, { rejectWithValue }) => {
    try {
      return await refreshRequest();
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err, "Not logged in"));
    }
  }
);

export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  await logoutRequest();
});

/**
 * Merges the guest localStorage cart into the authenticated user's server-side cart.
 * Call this immediately after loginUser.fulfilled if guestCart is non-empty.
 * Clears localStorage guestCart on success.
 */
export const mergeGuestCart = createAsyncThunk(
  "auth/mergeGuestCart",
  async (_, { rejectWithValue }) => {
    if (typeof window === "undefined") return;

    const raw = window.localStorage.getItem("guestCart");
    if (!raw) return; // nothing to merge

    let guestItems: { variantId: string; quantity: number }[] = [];
    try {
      const parsed = JSON.parse(raw);
      guestItems = parsed
        .filter((item: any) => item.variantId && item.quantity)
        .map((item: any) => ({ variantId: item.variantId, quantity: item.quantity }));
    } catch {
      window.localStorage.removeItem("guestCart");
      return;
    }

    if (guestItems.length === 0) return;

    try {
      await axiosInstance.post("/cart/merge", { guestItems });
      window.localStorage.removeItem("guestCart");
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err, "Cart merge failed"));
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        loginUser.fulfilled,
        (state, action: PayloadAction<{ accessToken: string; user: AuthUser }>) => {
          state.status = "succeeded";
          state.accessToken = action.payload.accessToken;
          state.user = action.payload.user;
          state.isAuthenticated = true;
        }
      )
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(refreshSession.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        refreshSession.fulfilled,
        (state, action: PayloadAction<{ accessToken: string; user: AuthUser }>) => {
          state.status = "succeeded";
          state.accessToken = action.payload.accessToken;
          state.user = action.payload.user;
          state.isAuthenticated = true;
          state.initialized = true;
        }
      )
      .addCase(refreshSession.rejected, (state) => {
        state.status = "idle";
        state.accessToken = null;
        state.user = null;
        state.isAuthenticated = false;
        state.initialized = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.status = "idle";
      });
  },
});

export default authSlice.reducer;