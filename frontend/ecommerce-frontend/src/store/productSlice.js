import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import productService from '../services/productService';

// 1. Отримання списку продуктів (з підтримкою пагінації)
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params, thunkAPI) => {
    try {
      const response = await productService.getProducts(params);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 2. Отримання деталей конкретного продукту
export const fetchProductDetails = createAsyncThunk(
  'products/fetchProductDetails',
  async (id, thunkAPI) => {
    try {
      const response = await productService.getProduct(id);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    count: 0,
    selectedProduct: null, // ВАЖЛИВО: назва збігається з тією, що в ProductDetail.jsx
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // --- СТАН ДЛЯ СПИСКУ ПРОДУКТІВ (Home) ---
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        // Перевіряємо, чи прийшли дані з пагінацією від бекенду
        if (action.payload && action.payload.results) {
          state.items = action.payload.results;
          state.count = action.payload.count;
        } else {
          state.items = action.payload || [];
          state.count = action.payload?.length || 0;
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- СТАН ДЛЯ ДЕТАЛЕЙ ПРОДУКТУ (ProductDetail) ---
      .addCase(fetchProductDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload; // Зберігаємо саме в selectedProduct
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default productSlice.reducer;