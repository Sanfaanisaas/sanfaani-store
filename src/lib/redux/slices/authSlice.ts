import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { errorMessage, ApiError, setRuntimeAccessToken } from "@/lib/api/client";
import { loginRequest, logoutRequest, refreshRequest, registerRequest, type LoginPayload, type RegisterPayload } from "@/lib/api/authApi";
import type { ApiUser, AuthSession } from "@/lib/api/contracts";
import { clearPrivateCustomerState } from "@/lib/redux/sessionCleanup";
import type { AppDispatch } from "@/lib/redux/store";

export type SessionPhase = "restoring" | "signed_out" | "authenticated" | "expired" | "unavailable";
export type AuthUser = ApiUser;
interface AuthState { user: AuthUser | null; accessToken: string | null; isAuthenticated: boolean; status: "idle" | "loading" | "succeeded" | "failed"; initialized: boolean; phase: SessionPhase; error: string | null; }
const initialState: AuthState = { user: null, accessToken: null, isAuthenticated: false, status: "idle", initialized: false, phase: "restoring", error: null };

function storeSession(session: AuthSession) { setRuntimeAccessToken(session.accessToken); return session; }
export const registerUser = createAsyncThunk("auth/registerUser", async (payload: RegisterPayload, { rejectWithValue }) => { try { return await registerRequest(payload); } catch (error) { return rejectWithValue(errorMessage(error, "Registration failed.")); } });
export const loginUser = createAsyncThunk("auth/loginUser", async (payload: LoginPayload, { rejectWithValue }) => { try { return storeSession(await loginRequest(payload)); } catch (error) { return rejectWithValue(errorMessage(error, "Invalid email or password.")); } });
export const refreshSession = createAsyncThunk("auth/refreshSession", async (_, { rejectWithValue }) => { try { return storeSession(await refreshRequest()); } catch (error) { return rejectWithValue(error instanceof ApiError ? error.kind : "unknown"); } });
/** Always clear local private state, even when the server cannot be reached. */
export const logoutUser = createAsyncThunk("auth/logoutUser", async (_, { dispatch }) => {
  try { await logoutRequest(); } finally { setRuntimeAccessToken(null); clearPrivateCustomerState(dispatch as AppDispatch); }
});

const authSlice = createSlice({
  name: "auth", initialState,
  reducers: {
    sessionExpired(state) { setRuntimeAccessToken(null); state.user = null; state.accessToken = null; state.isAuthenticated = false; state.initialized = true; state.status = "idle"; state.phase = "expired"; state.error = "Your session has expired. Please sign in again."; },
    clearAuthError(state) { state.error = null; },
  },
  extraReducers: (builder) => builder
    .addCase(registerUser.pending, (state) => { state.status = "loading"; state.error = null; })
    .addCase(registerUser.fulfilled, (state) => { state.status = "succeeded"; })
    .addCase(registerUser.rejected, (state, action) => { state.status = "failed"; state.error = String(action.payload ?? "Registration failed."); })
    .addCase(loginUser.pending, (state) => { state.status = "loading"; state.error = null; })
    .addCase(loginUser.fulfilled, (state, action: PayloadAction<AuthSession>) => { state.status = "succeeded"; state.accessToken = action.payload.accessToken; state.user = action.payload.user; state.isAuthenticated = true; state.initialized = true; state.phase = "authenticated"; })
    .addCase(loginUser.rejected, (state, action) => { setRuntimeAccessToken(null); state.status = "failed"; state.error = String(action.payload ?? "Unable to sign in."); state.phase = "signed_out"; state.initialized = true; })
    .addCase(refreshSession.pending, (state) => { if (!state.initialized) state.phase = "restoring"; state.status = "loading"; })
    .addCase(refreshSession.fulfilled, (state, action: PayloadAction<AuthSession>) => { state.status = "succeeded"; state.accessToken = action.payload.accessToken; state.user = action.payload.user; state.isAuthenticated = true; state.initialized = true; state.phase = "authenticated"; state.error = null; })
    .addCase(refreshSession.rejected, (state, action) => { setRuntimeAccessToken(null); const kind = action.payload; state.status = "idle"; state.accessToken = null; state.user = null; state.isAuthenticated = false; state.initialized = true; state.phase = kind === "unavailable" || kind === "network" || kind === "timeout" ? "unavailable" : "signed_out"; state.error = state.phase === "unavailable" ? "We could not restore your session. Please try again." : null; })
    .addCase(logoutUser.fulfilled, (state) => { state.user = null; state.accessToken = null; state.isAuthenticated = false; state.status = "idle"; state.initialized = true; state.phase = "signed_out"; state.error = null; }),
});
export const { sessionExpired, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
