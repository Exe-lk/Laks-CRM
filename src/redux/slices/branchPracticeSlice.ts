import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface Branch {
  id: string;
  name: string;
  address: string;
  location: string;
  telephone?: string;
  email?: string;
  password:string;
  status: 'active' | 'inactive' | 'approved' | 'pending approval' | 'cancel';
  practiceId: string;
  createdAt: string;
  updatedAt: string;
  practice?: {
    id: string;
    name: string;
    email?: string;
    telephone?: string;
  };
}

export interface CreateBranchData {
  name: string;
  address: string;
  location: string;
  telephone?: string;
  email?: string;
  password:string;
  practiceId: string;
  status?: 'active' | 'inactive' | 'approved' | 'pending approval' | 'cancel';
}

export interface UpdateBranchData {
  id: string;
  name?: string;
  address?: string;
  location?: string;
  telephone?: string;
  email?: string;
  password?: string;
  status?: 'active' | 'inactive' | 'approved' | 'pending approval' | 'cancel';
}

interface BranchState {
  branches: Branch[];
  loading: boolean;
  error: string | null;
  currentBranch: Branch | null;
}

const initialState: BranchState = {
  branches: [],
  loading: false,
  error: null,
  currentBranch: null,
};

export const fetchBranches = createAsyncThunk(
  'branches/fetchBranches',
  async (practiceId: string) => {
    const response = await fetch(`/api/branch/get-all?practiceId=${practiceId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch branches');
    }
    const data = await response.json();
    return data.branches;
  }
);

export const createBranch = createAsyncThunk(
  'branches/createBranch',
  async (branchData: CreateBranchData) => {
    const response = await fetch('/api/branch/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(branchData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create branch');
    }
    const data = await response.json();
    return data.branch;
  }
);

export const updateBranch = createAsyncThunk(
  'branches/updateBranch',
  async (branchData: UpdateBranchData) => {
    const response = await fetch('/api/branch/update', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(branchData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update branch');
    }
    const data = await response.json();
    return data.branch;
  }
);

export const deleteBranch = createAsyncThunk(
  'branches/deleteBranch',
  async (branchId: string) => {
    const response = await fetch('/api/branch/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: branchId }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete branch');
    }
    return branchId;
  }
);

const branchSlice = createSlice({
  name: 'branches',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentBranch: (state, action: PayloadAction<Branch | null>) => {
      state.currentBranch = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBranches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBranches.fulfilled, (state, action) => {
        state.loading = false;
        state.branches = action.payload;
        state.error = null;
      })
      .addCase(fetchBranches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch branches';
      })
      .addCase(createBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.branches.unshift(action.payload);
        state.error = null;
      })
      .addCase(createBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create branch';
      })
      .addCase(updateBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBranch.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.branches.findIndex(branch => branch.id === action.payload.id);
        if (index !== -1) {
          state.branches[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update branch';
      })
      .addCase(deleteBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.branches = state.branches.filter(branch => branch.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete branch';
      });
  },
});

export const { clearError, setCurrentBranch } = branchSlice.actions;
export default branchSlice.reducer;
