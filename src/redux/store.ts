import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { locumProfileApiSlice } from './slices/locumProfileSlice';
import { PracticeProfileApiSlice } from './slices/practiceProfileSlice';
import {bookingApiSlice} from './slices/bookingPracticeSlice';
import { appointmentApiSlice } from './slices/appointmentPracticeSlice';
import { appointmentRequestsLocumApiSlice } from './slices/appoitmentRequestsLocumSlice';

const store = configureStore({
	reducer: {
		[locumProfileApiSlice.reducerPath]: locumProfileApiSlice.reducer,
		[PracticeProfileApiSlice.reducerPath]: PracticeProfileApiSlice.reducer,
		[bookingApiSlice.reducerPath]: bookingApiSlice.reducer,
		[appointmentApiSlice.reducerPath]: appointmentApiSlice.reducer,
		[appointmentRequestsLocumApiSlice.reducerPath]: appointmentRequestsLocumApiSlice.reducer
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(
			locumProfileApiSlice.middleware,
			PracticeProfileApiSlice.middleware,
			bookingApiSlice.middleware,
			appointmentApiSlice.middleware,
			appointmentRequestsLocumApiSlice.middleware
		),
});
setupListeners(store.dispatch);

export default store;
