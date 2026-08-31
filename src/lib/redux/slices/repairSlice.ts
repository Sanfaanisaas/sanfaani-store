import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { customerApiMessage } from "@/lib/api/customerStates";
import { createRepair, type CreatedRepair, type RepairRequestPayload } from "@/lib/api/repairsApi";

export type DeviceDetails = RepairRequestPayload["device"];
export type RepairPayload = RepairRequestPayload;
interface RepairState { currentRepair: CreatedRepair | null; isLoading: boolean; error: string | null; isSuccess: boolean; }
const initialState: RepairState = { currentRepair: null, isLoading: false, error: null, isSuccess: false };
export const submitRepairRequest = createAsyncThunk("repair/submitRepairRequest", async (payload: RepairPayload, { rejectWithValue }) => { try { return await createRepair(payload); } catch (error) { return rejectWithValue(customerApiMessage(error, "Unable to submit your repair request.")); } });
const repairSlice = createSlice({ name: "repair", initialState, reducers: { resetRepairState: () => initialState }, extraReducers: (builder) => builder.addCase(submitRepairRequest.pending, (state) => { state.isLoading = true; state.error = null; state.isSuccess = false; }).addCase(submitRepairRequest.fulfilled, (state, action: PayloadAction<CreatedRepair>) => { state.isLoading = false; state.isSuccess = true; state.currentRepair = action.payload; }).addCase(submitRepairRequest.rejected, (state, action) => { state.isLoading = false; state.error = String(action.payload ?? "Unable to submit your repair request."); }) });
export const { resetRepairState } = repairSlice.actions;
export default repairSlice.reducer;
