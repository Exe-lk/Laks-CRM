import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { locumProfileApiSlice } from './slices/locumProfileSlice';

const store = configureStore({
	reducer: {
		[locumProfileApiSlice.reducerPath]: locumProfileApiSlice.reducer
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(
			locumProfileApiSlice.middleware
		),
});
setupListeners(store.dispatch);

export default store;
