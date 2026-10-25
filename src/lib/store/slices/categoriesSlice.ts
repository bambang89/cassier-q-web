import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { CategoryPayload } from '@/types/api';
import * as categoriesApi from '@/services/categoriesApi';
import type { CategoriesState } from '@/lib/store/types';

const initialState: CategoriesState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchCategories = createAsyncThunk('categories/fetchAll', categoriesApi.fetchCategories);

export const createCategory = createAsyncThunk(
  'categories/create',
  async (payload: CategoryPayload) => categoriesApi.createCategory(payload),
);

export const deleteCategory = createAsyncThunk('categories/delete', async (id: string) => {
  await categoriesApi.deleteCategory(id);
  return id;
});

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Gagal memuat kategori';
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.items = state.items.filter((category) => category.id !== action.payload);
      });
  },
});

export default categoriesSlice.reducer;
