import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface EmailData {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

interface EmailState {
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: EmailState = {
  loading: false,
  error: null,
  successMessage: null, 
};

export const sendEmail = createAsyncThunk(
  'email/sendEmail',
  async (emailData: EmailData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('to', emailData.to);
      formData.append('subject', emailData.subject);
      if (emailData.text) formData.append('text', emailData.text);
      if (emailData.html) formData.append('html', emailData.html);

      const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/email/send-email`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send email');
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const emailSlice = createSlice({
  name: 'email',
  initialState,
  reducers: {
    clearEmailState: (state) => {
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
      .addCase(sendEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(sendEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Email sent successfully!';
      })
      .addCase(sendEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearEmailState, clearError, clearSuccess } = emailSlice.actions;

export default emailSlice.reducer;