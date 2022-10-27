import actionCreatorFactory from 'typescript-fsa';
import { asyncFactory } from 'typescript-fsa-redux-thunk';
import { IState, reducer, initialState } from './reducer';

const actionPrefix = '@cases';
export const createAction = actionCreatorFactory(actionPrefix);
export const createAsyncAction = asyncFactory<IState>(createAction);

export enum ActionType {
  // Case:
  SET_CASE = 'SET_CASE',
  CREATE_CASE = 'CREATE_CASE',
  MODIFY_CASE = 'MODIFY_CASE',
  REMOVE_CASE = 'REMOVE_CASE',
  ERASE_CASE = 'ERASE_CASE',
  GET_DELETED_CASES = 'GET_DELETED_CASES',
  RESTORE_DELETED_CASE = 'RESTORE_DELETED_CASE',
  CREATE_CASE_INTENT = 'CREATE_CASE_INTENT',
  RESET = 'RESET',
}

export const getFullActionType = (typeId: ActionType) => {
  return `${actionPrefix}/${typeId}`;
};

export const syncTriggers: { [type: string]: true } = [
  ActionType.CREATE_CASE,
  ActionType.MODIFY_CASE,
  ActionType.REMOVE_CASE,
].reduce((acc, typeId) => {
  const type = getFullActionType(typeId);
  acc[type] = true;
  return acc;
}, {} as { [type: string]: true });

// ------------------------
// Actions & reducers
// ------------------------
export const resetCasesModule = createAction<Error | void>(ActionType.RESET);
reducer.case(resetCasesModule, (state, error) => {
  if (error) {
    return {
      ...initialState,
      error,
    };
  }
  return initialState;
});
