import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

export interface DeviceDetails {
  type: string;
  brand: string;
  model: string;
  serialNumber?: string;
}

// Updated: intakePhotos accepts raw File objects from the file input
export interface RepairPayload {
  device: DeviceDetails;
  issueDescription: string;
  privacyAcknowledged: boolean;
  intakePhotos?: File[];
}

interface RepairState {
  currentRepair: any | null;
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
}

const initialState: RepairState = {
  currentRepair: null,
  isLoading: false,
  error: null,
  isSuccess: false,
};

// Async Thunk converting the payload into FormData for binary file uploads
export const submitRepairRequest = createAsyncThunk(
  "repair/submitRepairRequest",
  async (payload: RepairPayload, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      // Append structured data as a JSON string
      formData.append("device", JSON.stringify(payload.device));
      formData.append("issueDescription", payload.issueDescription);
      formData.append("privacyAcknowledged", String(payload.privacyAcknowledged));

      // Append each raw File object to multipart request
      if (payload.intakePhotos && payload.intakePhotos.length > 0) {
        payload.intakePhotos.forEach((file) => {
          formData.append("intakePhotos", file);
        });
      }

      const response = await axios.post("/api/repairs", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(
          error.response.data?.message || "Failed to submit repair request."
        );
      }
      return rejectWithValue(error.message || "An unexpected error occurred.");
    }
  }
);

const repairSlice = createSlice({
  name: "repair",
  initialState,
  reducers: {
    resetRepairState: (state) => {
      state.isLoading = false;
      state.error = null;
      state.isSuccess = false;
      state.currentRepair = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitRepairRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.isSuccess = false;
      })
      .addCase(submitRepairRequest.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentRepair = action.payload;
      })
      .addCase(submitRepairRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetRepairState } = repairSlice.actions;
export default repairSlice.reducer;