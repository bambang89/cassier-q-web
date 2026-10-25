import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { RegisterProductUnitPayload } from '@/types/api';
import * as productsApi from '@/services/productsApi';
import type { ProductUnitsState } from '@/lib/store/types';

const initialState: ProductUnitsState = {
  byProductId: {},
  statusByProductId: {},
  registerStatus: 'idle',
  registerError: null,
};

export const fetchProductUnits = createAsyncThunk('productUnits/fetchForProduct', async (productId: string) => {
  const items = await productsApi.fetchProductUnits(productId);
  return { productId, items };
});

export const registerProductUnit = createAsyncThunk(
  'productUnits/register',
  async ({ productId, payload }: { productId: string; payload: RegisterProductUnitPayload }) => {
    const unit = await productsApi.registerProductUnit(productId, payload);
    return { productId, unit };
  },
);

const productUnitsSlice = createSlice({
  name: 'productUnits',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductUnits.pending, (state, action) => {
        state.statusByProductId[action.meta.arg] = 'loading';
      })
      .addCase(fetchProductUnits.fulfilled, (state, action) => {
        state.statusByProductId[action.payload.productId] = 'succeeded';
        state.byProductId[action.payload.productId] = action.payload.items;
      })
      .addCase(fetchProductUnits.rejected, (state, action) => {
        state.statusByProductId[action.meta.arg] = 'failed';
      })
      .addCase(registerProductUnit.pending, (state) => {
        state.registerStatus = 'loading';
        state.registerError = null;
      })
      .addCase(registerProductUnit.fulfilled, (state, action) => {
        state.registerStatus = 'succeeded';
        const { productId, unit } = action.payload;
        const existing = state.byProductId[productId] ?? [];
        const index = existing.findIndex((u) => u.unitId === unit.unitId);
        if (index >= 0) existing[index] = unit;
        else existing.push(unit);
        state.byProductId[productId] = existing;
      })
      .addCase(registerProductUnit.rejected, (state, action) => {
        state.registerStatus = 'failed';
        state.registerError = action.error.message ?? 'Satuan tidak bisa didaftarkan';
      });
  },
});

export default productUnitsSlice.reducer;
