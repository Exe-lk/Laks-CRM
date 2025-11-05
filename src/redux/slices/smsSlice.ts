import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface SMSData {
  to: string;
  body?: string;
  message?: string;
}

interface SMSState {
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: SMSState = {
  loading: false,
  error: null,
  successMessage: null, 
};

export const sendSMS = createAsyncThunk(
  'sms/sendSMS',
  async (smsData: SMSData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/sms/send-sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: smsData.to,
          body: smsData.body || smsData.message,
          message: smsData.message || smsData.body,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send SMS');
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const smsSlice = createSlice({
  name: 'sms',
  initialState,
  reducers: {
    clearSMSState: (state) => {
      state.loading = false;
      state.error = null;
      state.successMessage = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendSMS.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(sendSMS.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'SMS sent successfully!';
      })
      .addCase(sendSMS.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSMSState, clearError, clearSuccess } = smsSlice.actions;

export default smsSlice.reducer;

