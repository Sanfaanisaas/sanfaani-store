import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { apiClient, errorMessage } from "@/lib/api/client";
import type { PublicRepairTracking } from "@/lib/api/contracts";
export interface DeviceDetails { type: string; brand: string; model: string; serialNumber?: string; }
export interface RepairPayload { device: DeviceDetails; issueDescription: string; privacyAcknowledged: boolean; }
interface RepairState { currentRepair: PublicRepairTracking | null; isLoading: boolean; error: string | null; isSuccess: boolean; }
const initialState: RepairState = { currentRepair: null, isLoading: false, error: null, isSuccess: false };
export const submitRepairRequest = createAsyncThunk("repair/submitRepairRequest", async (payload: RepairPayload, { rejectWithValue }) => { try { return await apiClient.post<PublicRepairTracking>("/repairs", { body: payload, idempotencyKey: crypto.randomUUID() }); } catch (error) { return rejectWithValue(errorMessage(error, "Unable to submit your repair request.")); } });
const repairSlice = createSlice({ name: "repair", initialState, reducers: { resetRepairState: () => initialState }, extraReducers: (builder) => builder.addCase(submitRepairRequest.pending, (state) => { state.isLoading = true; state.error = null; state.isSuccess = false; }).addCase(submitRepairRequest.fulfilled, (state, action: PayloadAction<PublicRepairTracking>) => { state.isLoading = false; state.isSuccess = true; state.currentRepair = action.payload; }).addCase(submitRepairRequest.rejected, (state, action) => { state.isLoading = false; state.error = String(action.payload ?? "Unable to submit your repair request."); }) });
export const { resetRepairState } = repairSlice.actions;
export default repairSlice.reducer;
