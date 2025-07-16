import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { locumProfileApiSlice } from './slices/locumProfileSlice';
import { PracticeProfileApiSlice } from './slices/practiceProfileSlice';


const store = configureStore({
	reducer: {
		[locumProfileApiSlice.reducerPath]: locumProfileApiSlice.reducer,
		[PracticeProfileApiSlice.reducerPath]: PracticeProfileApiSlice.reducer
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(
			locumProfileApiSlice.middleware,
			PracticeProfileApiSlice.middleware
		),
});
setupListeners(store.dispatch);

export default store;
