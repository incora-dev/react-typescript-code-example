import pureAssign from 'pure-assign';
import { getById } from '@app/utils/helpers';
import { ICase } from '@app/constants/case';
import { mergeCase, mergeCaseHashes } from './utils';
import { ActionType, createAction } from './actions';
import { reducer } from './reducer';
import { CasesHash } from './constants';

// ------------------------
// Actions & reducers
// ------------------------
export const setCasesHash = createAction<{
  casesHash: CasesHash;
  forceMergeHash?: CasesHash;
  markSyncing?: boolean;
}>(ActionType.SET_CASES_HASH);
reducer.case(
  setCasesHash,
  (state, { casesHash, forceMergeHash, markSyncing }) => {
    const prevCasesHash = state.cases;
    return pureAssign(state, {
      cases: mergeCaseHashes(casesHash, prevCasesHash, forceMergeHash),
      syncing: markSyncing ? false : state.syncing,
      loading: markSyncing ? false : state.loading,
    });
  }
);

export const setCaseItem = createAction<{
  caseItem: ICase;
  sessionId?: string;
}>(ActionType.SET_CASE);
reducer.case(setCaseItem, (state, { caseItem, sessionId }) => {
  const prevCaseItem = getById(state.cases, caseItem.id);
  return pureAssign(state, {
    cases: {
      ...state.cases,
      [caseItem.id]: mergeCase(caseItem, prevCaseItem, sessionId, true),
    },
  });
});
