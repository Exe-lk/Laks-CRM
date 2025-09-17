import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { locumProfileApiSlice } from './slices/locumProfileSlice';
import { PracticeProfileApiSlice } from './slices/practiceProfileSlice';
import {bookingApiSlice} from './slices/bookingPracticeSlice';
import { appointmentApiSlice } from './slices/appointmentPracticeSlice';
import { appointmentRequestsLocumApiSlice } from './slices/appoitmentRequestsLocumSlice';
import { ratePracticeApiSlice } from './slices/ratePracticeSlice';
import { PracticeUserPaymentApiSlice } from './slices/practiceUserPaymentSlice';
import { cardPracticeUserApiSlice } from './slices/cardPracticeUserSlice';
import branchReducer from './slices/branchPracticeSlice';

const store = configureStore({
	reducer: {
		[locumProfileApiSlice.reducerPath]: locumProfileApiSlice.reducer,
		[PracticeProfileApiSlice.reducerPath]: PracticeProfileApiSlice.reducer,
		[bookingApiSlice.reducerPath]: bookingApiSlice.reducer,
		[appointmentApiSlice.reducerPath]: appointmentApiSlice.reducer,
		[appointmentRequestsLocumApiSlice.reducerPath]: appointmentRequestsLocumApiSlice.reducer,
		[ratePracticeApiSlice.reducerPath]: ratePracticeApiSlice.reducer,
		[PracticeUserPaymentApiSlice.reducerPath]: PracticeUserPaymentApiSlice.reducer,
		[cardPracticeUserApiSlice.reducerPath]: cardPracticeUserApiSlice.reducer,
		branches: branchReducer
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(
			locumProfileApiSlice.middleware,
			PracticeProfileApiSlice.middleware,
			bookingApiSlice.middleware,
			appointmentApiSlice.middleware,
			appointmentRequestsLocumApiSlice.middleware,
			ratePracticeApiSlice.middleware,
			PracticeUserPaymentApiSlice.middleware,
			cardPracticeUserApiSlice.middleware
		),
});
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
