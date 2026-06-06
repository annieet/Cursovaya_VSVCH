import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as client from '../api/client.js';

const initialState = {
  user: null,
  status: 'idle',
  error: null,
};

export const bootstrapAuth = createAsyncThunk('auth/bootstrap', async (_, { rejectWithValue }) => {
  if (!client.getStoredToken()) return null;
  try {
    return await client.api('/auth/me');
  } catch {
    client.setStoredToken(null);
    return rejectWithValue(null);
  }
});

export const login = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const data = await client.api('/auth/login', { method: 'POST', body: { email, password } });
    client.setStoredToken(data.token);
    return data.user;
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

export const register = createAsyncThunk(
  'auth/register',
  async ({ email, password, name }, { rejectWithValue }) => {
    try {
      const data = await client.api('/auth/register', { method: 'POST', body: { email, password, name } });
      client.setStoredToken(data.token);
      return data.user;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      client.setStoredToken(null);
      state.user = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapAuth.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        state.status = 'ready';
        state.user = action.payload ?? null;
      })
      .addCase(bootstrapAuth.rejected, (state) => {
        state.status = 'ready';
        state.user = null;
      })
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'ready';
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'ready';
        state.error = action.payload;
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'ready';
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'ready';
        state.error = action.payload;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
