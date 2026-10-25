import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { FetchSalesSummaryParams } from '@/types/api';
import * as reportsApi from '@/services/reportsApi';
import type { ReportsState } from '@/lib/store/types';

const initialState: ReportsState = {
  summary: null,
  status: 'idle',
  error: null,
};

export const fetchSalesSummary = createAsyncThunk(
  'reports/fetchSummary',
  async (params: FetchSalesSummaryParams = {}) => reportsApi.fetchSalesSummary(params),
);

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSalesSummary.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSalesSummary.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.summary = action.payload;
      })
      .addCase(fetchSalesSummary.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Gagal memuat laporan';
      });
  },
});

export default reportsSlice.reducer;
