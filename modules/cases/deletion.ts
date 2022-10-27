import pureAssign from 'pure-assign';
import apiRequest from '@app/utils/request';
import { getById, omitProps } from '@app/utils/helpers';
import { deletePendingHashItem } from './utils';
import { ActionType, createAction } from './actions';
import { reducer } from './reducer';

// ------------------------
// Requests
// ------------------------
export const deleteCase = async (id: string): Promise<void> => {
  await apiRequest({
    url: `/case/${id}`,
    method: 'delete',
  });
};

// ------------------------
// Actions & reducers
// ------------------------
export const removeCase = createAction<{ caseId: string }>(
  ActionType.REMOVE_CASE
);
reducer.case(removeCase, (state, { caseId }) => {
  const caseItem = getById(state.cases, caseId);
  if (!caseItem) return state;
  const nextCases = deletePendingHashItem(state.cases, caseId);
  return pureAssign(state, {
    cases: nextCases,
  });
});

export const eraseCase = createAction<{ caseId: string }>(
  ActionType.ERASE_CASE
);
reducer.case(eraseCase, (state, { caseId }) => {
  const caseItem = getById(state.cases, caseId);
  if (!caseItem) return state;
  return pureAssign(state, {
    cases: omitProps(state.cases, caseId),
  });
});
