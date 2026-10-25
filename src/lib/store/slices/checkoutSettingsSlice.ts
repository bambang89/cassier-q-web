import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { UpdateCheckoutSettingsPayload } from '@/types/api';
import * as settingsApi from '@/services/settingsApi';
import type { CheckoutSettingsState } from '@/lib/store/types';
import { apiErrorMessage } from '@/utils/apiErrors';

const initialState: CheckoutSettingsState = { settings: null, status: 'idle' };

export const fetchCheckoutSettings = createAsyncThunk('checkoutSettings/fetch', settingsApi.fetchCheckoutSettings);

export const saveCheckoutSettings = createAsyncThunk(
  'checkoutSettings/save',
  async (payload: UpdateCheckoutSettingsPayload, { rejectWithValue }) => {
    try {
      return await settingsApi.updateCheckoutSettings(payload);
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error, 'Pengaturan tidak bisa disimpan.'));
    }
  },
);

const checkoutSettingsSlice = createSlice({
  name: 'checkoutSettings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCheckoutSettings.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCheckoutSettings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.settings = action.payload;
      })
      .addCase(fetchCheckoutSettings.rejected, (state) => {
        state.status = 'failed';
      })
      .addCase(saveCheckoutSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
      });
  },
});

export default checkoutSettingsSlice.reducer;
