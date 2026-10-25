import { configureStore } from '@reduxjs/toolkit';

import authReducer from '@/lib/store/slices/authSlice';
import cartReducer from '@/lib/store/slices/cartSlice';
import productsReducer from '@/lib/store/slices/productsSlice';
import productUnitsReducer from '@/lib/store/slices/productUnitsSlice';
import productPhotosReducer from '@/lib/store/slices/productPhotosSlice';
import categoriesReducer from '@/lib/store/slices/categoriesSlice';
import unitsReducer from '@/lib/store/slices/unitsSlice';
import cashierSessionReducer from '@/lib/store/slices/cashierSessionSlice';
import ordersReducer from '@/lib/store/slices/ordersSlice';
import reportsReducer from '@/lib/store/slices/reportsSlice';
import storeProfileReducer from '@/lib/store/slices/storeProfileSlice';
import customersReducer from '@/lib/store/slices/customersSlice';
import suppliersReducer from '@/lib/store/slices/suppliersSlice';
import purchaseOrdersReducer from '@/lib/store/slices/purchaseOrdersSlice';
import employeesReducer from '@/lib/store/slices/employeesSlice';
import rolesReducer from '@/lib/store/slices/rolesSlice';
import accessReducer from '@/lib/store/slices/accessSlice';
import checkoutSettingsReducer from '@/lib/store/slices/checkoutSettingsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    products: productsReducer,
    productUnits: productUnitsReducer,
    productPhotos: productPhotosReducer,
    categories: categoriesReducer,
    units: unitsReducer,
    cashierSession: cashierSessionReducer,
    orders: ordersReducer,
    reports: reportsReducer,
    storeProfile: storeProfileReducer,
    customers: customersReducer,
    suppliers: suppliersReducer,
    purchaseOrders: purchaseOrdersReducer,
    employees: employeesReducer,
    roles: rolesReducer,
    access: accessReducer,
    checkoutSettings: checkoutSettingsReducer,
  },
  // Thunk upload foto menerima File (tidak serializable) di meta.arg.
  middleware: (getDefault) =>
    getDefault({ serializableCheck: { ignoredActionPaths: ['meta.arg'] } }),
});

