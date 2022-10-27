import pureAssign from 'pure-assign';
import { RequestError } from '@app/utils/request';
import { ICasesError, reducer } from './reducer';
import { ActionType, createAction } from './actions';

// ------------------------
// Helpers
// ------------------------
export const isRequestErrorMuted = (error: RequestError) => {
	if (!error.response) return true;
	return false;
};

export const formatRequestError = (error: RequestError): RequestError | null => {
	if (isRequestErrorMuted(error)) return null;
	const resMessage = error.response?.data.errorMessage;
	if (resMessage) error.message = `${error.message}\n${resMessage}`;
	return error;
};

// ------------------------
// Actions & reducers
// ------------------------
export const setCaseError = createAction<ICasesError>(ActionType.SET_ERROR);
reducer.case(setCaseError, (state, error) => {
	return pureAssign(state, {
		error,
	});
});

export const clearCaseError = createAction(ActionType.CLEAR_ERROR);
reducer.case(clearCaseError, (state) => {
	return pureAssign(state, {
		error: null,
	});
});
