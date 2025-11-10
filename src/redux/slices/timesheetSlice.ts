import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface TimesheetEntry {
  id: string;
  timesheetId: string;
  date: string;
  clockInTime?: string;
  clockOutTime?: string;
  lunchStartTime?: string;
  lunchEndTime?: string;
  totalHours?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LocumProfile {
  fullName: string;
  emailAddress: string;
  contactNumber: string;
  role: string;
}

export interface Practice {
  name: string;
  email: string;
  telephone: string;
  location: string;
  practiceType: string;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  location: string;
}

export interface Timesheet {
  id: string;
  locumId: string;
  practiceId: string;
  branchId?: string;
  weekStartDate: string;
  weekEndDate: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'LOCKED';
  totalHours?: number;
  totalPay?: number;
  hourlyRate?: number;
  createdBy: 'LOCUM' | 'PRACTICE';
  staffSignature?: string;
  staffSignatureDate?: string;
  managerSignature?: string;
  managerSignatureDate?: string;
  managerId?: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
  locumProfile?: LocumProfile;
  practice?: Practice;
  branch?: Branch;
  timesheetEntries: TimesheetEntry[];
}

export interface TimesheetState {
  timesheets: Timesheet[];
  currentTimesheet?: Timesheet;
  selectedDate?: string;
  selectedEntry?: TimesheetEntry;
  loading: boolean;
  error: string | null;
  summary: {
    total: number;
    draft: number;
    pendingApproval: number;
    locked: number;
    totalHours: number;
    totalPay: number;
  };
}

const initialState: TimesheetState = {
  timesheets: [],
  loading: false,
  error: null,
  summary: {
    total: 0,
    draft: 0,
    pendingApproval: 0,
    locked: 0,
    totalHours: 0,
    totalPay: 0,
  },
};

export const fetchTimesheets = createAsyncThunk(
  'timesheet/fetchTimesheets',
  async (params: {
    userId: string;
    userType: 'locum' | 'practice' | 'branch';
    token: string;
    status?: string;
    weekStartDate?: string;
    weekEndDate?: string;
  }) => {
    const queryParams = new URLSearchParams({
      userId: params.userId,
      userType: params.userType,
      ...(params.status && { status: params.status }),
      ...(params.weekStartDate && { weekStartDate: params.weekStartDate }),
      ...(params.weekEndDate && { weekEndDate: params.weekEndDate }),
    });

    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/timesheet/list-timesheets?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${params.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch timesheets');
    }

    const data = await response.json();
    return data;
  }
);

export const createTimesheet = createAsyncThunk(
  'timesheet/createTimesheet',
  async (params: {
    locumId: string;
    practiceId: string;
    branchId?: string;
    weekStartDate: string;
    hourlyRate?: number;
    token: string;
  }) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/timesheet/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${params.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        locumId: params.locumId,
        practiceId: params.practiceId,
        branchId: params.branchId,
        weekStartDate: params.weekStartDate,
        hourlyRate: params.hourlyRate,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create timesheet');
    }

    const data = await response.json();
    return data;
  }
);

export const clockInOut = createAsyncThunk(
  'timesheet/clockInOut',
  async (params: {
    locumId: string;
    practiceId: string;
    branchId?: string;
    action: 'clock-in' | 'clock-out' | 'lunch-start' | 'lunch-end';
    date: string;
    time?: string;
    notes?: string;
    token: string;
  }) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/timesheet/clock-in-out`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${params.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        locumId: params.locumId,
        practiceId: params.practiceId,
        branchId: params.branchId,
        action: params.action,
        date: params.date,
        time: params.time,
        notes: params.notes,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to record clock action');
    }

    const data = await response.json();
    return data;
  }
);

export const updateTimesheetEntry = createAsyncThunk(
  'timesheet/updateEntry',
  async (params: {
    entryId: string;
    clockInTime?: string;
    clockOutTime?: string;
    lunchStartTime?: string;
    lunchEndTime?: string;
    notes?: string;
    token: string;
  }) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/timesheet/update-entry`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${params.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        entryId: params.entryId,
        clockInTime: params.clockInTime,
        clockOutTime: params.clockOutTime,
        lunchStartTime: params.lunchStartTime,
        lunchEndTime: params.lunchEndTime,
        notes: params.notes,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update timesheet entry');
    }

    const data = await response.json();
    return data;
  }
);

export const submitTimesheet = createAsyncThunk(
  'timesheet/submit',
  async (params: {
    timesheetId: string;
    staffSignature?: string;
    token: string;
  }) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/timesheet/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${params.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timesheetId: params.timesheetId,
        staffSignature: params.staffSignature,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to submit timesheet');
    }

    const data = await response.json();
    return data;
  }
);

export const approveTimesheet = createAsyncThunk(
  'timesheet/approve',
  async (params: {
    timesheetId: string;
    managerSignature?: string;
    token: string;
  }) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/timesheet/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${params.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timesheetId: params.timesheetId,
        managerSignature: params.managerSignature,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to approve timesheet');
    }

    const data = await response.json();
    return data;
  }
);

const timesheetSlice = createSlice({
  name: 'timesheet',
  initialState,
  reducers: {
    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
    },
    setSelectedEntry: (state, action: PayloadAction<TimesheetEntry | undefined>) => {
      state.selectedEntry = action.payload;
    },
    setCurrentTimesheet: (state, action: PayloadAction<Timesheet | undefined>) => {
      state.currentTimesheet = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearTimesheets: (state) => {
      state.timesheets = [];
      state.currentTimesheet = undefined;
      state.selectedEntry = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTimesheets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTimesheets.fulfilled, (state, action) => {
        state.loading = false;
        state.timesheets = action.payload.data;
        state.summary = action.payload.summary;
      })
      .addCase(fetchTimesheets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch timesheets';
      })
      
      .addCase(createTimesheet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTimesheet.fulfilled, (state, action) => {
        state.loading = false;
        const newTimesheet = action.payload.data;
        state.timesheets.unshift(newTimesheet);
      })
      .addCase(createTimesheet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create timesheet';
      })
      
      .addCase(clockInOut.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clockInOut.fulfilled, (state, action) => {
        state.loading = false;
        const timesheetId = action.payload.data.timesheetId;
        const timesheetIndex = state.timesheets.findIndex(t => t.id === timesheetId);
        if (timesheetIndex !== -1) {
          state.timesheets[timesheetIndex].totalHours = action.payload.data.totalHours;
          state.timesheets[timesheetIndex].totalPay = action.payload.data.totalPay;
        }
      })
      .addCase(clockInOut.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to record clock action';
      })
      
      .addCase(updateTimesheetEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTimesheetEntry.fulfilled, (state, action) => {
        state.loading = false;
        const updatedEntry = action.payload.data.entry;
        if (state.currentTimesheet) {
          const entryIndex = state.currentTimesheet.timesheetEntries.findIndex(
            e => e.id === updatedEntry.id
          );
          if (entryIndex !== -1) {
            state.currentTimesheet.timesheetEntries[entryIndex] = updatedEntry;
            state.currentTimesheet.totalHours = action.payload.data.weekTotalHours;
            state.currentTimesheet.totalPay = action.payload.data.weekTotalPay;
          }
        }
      })
      .addCase(updateTimesheetEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update timesheet entry';
      })
      
      .addCase(submitTimesheet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitTimesheet.fulfilled, (state, action) => {
        state.loading = false;
        const updatedTimesheet = action.payload.data;
        const timesheetIndex = state.timesheets.findIndex(t => t.id === updatedTimesheet.id);
        if (timesheetIndex !== -1) {
          state.timesheets[timesheetIndex] = updatedTimesheet;
        }
        if (state.currentTimesheet && state.currentTimesheet.id === updatedTimesheet.id) {
          state.currentTimesheet = updatedTimesheet;
        }
      })
      .addCase(submitTimesheet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to submit timesheet';
      })
      
      .addCase(approveTimesheet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveTimesheet.fulfilled, (state, action) => {
        state.loading = false;
        const updatedTimesheet = action.payload.data;
        const timesheetIndex = state.timesheets.findIndex(t => t.id === updatedTimesheet.id);
        if (timesheetIndex !== -1) {
          state.timesheets[timesheetIndex] = updatedTimesheet;
        }
        if (state.currentTimesheet && state.currentTimesheet.id === updatedTimesheet.id) {
          state.currentTimesheet = updatedTimesheet;
        }
      })
      .addCase(approveTimesheet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to approve timesheet';
      });
  },
});

export const {
  setSelectedDate,
  setSelectedEntry,
  setCurrentTimesheet,
  clearError,
  clearTimesheets,
} = timesheetSlice.actions;

export default timesheetSlice.reducer;
