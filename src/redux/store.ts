import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { locumProfileApiSlice } from './slices/locumProfileSlice';
import { PracticeProfileApiSlice } from './slices/practiceProfileSlice';
import {bookingApiSlice} from './slices/bookingPracticeSlice';
import { appointmentApiSlice } from './slices/appointmentPracticeSlice';
import { appointmentRequestsLocumApiSlice } from './slices/appoitmentRequestsLocumSlice';
import { ratePracticeApiSlice } from './slices/ratePracticeSlice';

const store = configureStore({
	reducer: {
		[locumProfileApiSlice.reducerPath]: locumProfileApiSlice.reducer,
		[PracticeProfileApiSlice.reducerPath]: PracticeProfileApiSlice.reducer,
		[bookingApiSlice.reducerPath]: bookingApiSlice.reducer,
		[appointmentApiSlice.reducerPath]: appointmentApiSlice.reducer,
		[appointmentRequestsLocumApiSlice.reducerPath]: appointmentRequestsLocumApiSlice.reducer,
		[ratePracticeApiSlice.reducerPath]: ratePracticeApiSlice.reducer
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(
			locumProfileApiSlice.middleware,
			PracticeProfileApiSlice.middleware,
			bookingApiSlice.middleware,
			appointmentApiSlice.middleware,
			appointmentRequestsLocumApiSlice.middleware,
			ratePracticeApiSlice.middleware
		),
});
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
