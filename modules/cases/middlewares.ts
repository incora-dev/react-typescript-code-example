import { Middleware, AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { syncCaseStateImmediately, syncCasesStateEnqueue } from './sync';
import { syncingSelector } from './selectors';
import { syncTriggers } from './actions';
import { IState } from './reducer';

export const casesSyncMiddleware: Middleware<unknown, IState, ThunkDispatch<IState, unknown, AnyAction>> = (store) => (next) => (action) => {
	const type = action.type;
	const prevState = store.getState();
	const isSyncing = syncingSelector(prevState);
	const result = next(action);
	if (syncTriggers[type]) {
		if (isSyncing) {
			syncCaseStateImmediately(store.getState, store.dispatch);
		} else {
			syncCasesStateEnqueue(store.getState, store.dispatch);
		}
	}
	return result;
};
