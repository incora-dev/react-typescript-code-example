import pureAssign from 'pure-assign';
import { currentLicenseSelector, isHospitalType } from '@app/modules/user';
import apiRequest from '@app/utils/request';
import { reduceBy } from '@app/utils/helpers';
import { CaseType, ICase, ICaseApi } from '@app/constants/case';
import { ILicense } from '@app/constants/user';
import { parseCase } from './utils';
import { ActionType, createAsyncAction } from './actions';
import { reducer } from './reducer';
import { CasesHash } from './constants';

// ------------------------
// Helpers
// ------------------------
export const getFetchCaseType = (license: ILicense): CaseType => {
  const isHospital = isHospitalType(license.clientType);
  return isHospital ? CaseType.FIELD_HOSPITAL : CaseType.PREHOSPITAL;
};

// ------------------------
// Requests
// ------------------------
export const fetchAllCases = async (caseType?: string): Promise<ICase[]> => {
  const response = await apiRequest<ICaseApi[]>({
    url: '/cases',
    method: 'get',
    params: { caseType },
  });
  const cases = response.data.map((item) => parseCase(item));
  return cases;
};

export const fetchAllDeletedCases = async (
  caseType?: string
): Promise<ICase[]> => {
  const response = await apiRequest<ICaseApi[]>({
    url: `/cases/deleted`,
    method: 'get',
    params: { caseType },
  });
  const dCases = response.data.map((item) => parseCase(item));
  return dCases;
};

export const fetchCase = async (caseId: string): Promise<ICase> => {
  const response = await apiRequest<ICaseApi>(`/case/${caseId}`);
  const item = parseCase(response.data);
  return item;
};

// ------------------------
// Actions & reducers
// ------------------------
export const fetchDeletedCases = createAsyncAction<void, ICase[], Error>(
  ActionType.GET_DELETED_CASES,
  (_, dispatch, getState) => {
    const state = getState();
    const license = currentLicenseSelector(state);
    const caseType = getFetchCaseType(license);
    return fetchAllDeletedCases(caseType);
  }
);

reducer.case(fetchDeletedCases.async.started, (state) => {
  return pureAssign(state, {
    deletedCasesLoading: true,
    fetchDeletedCasesError: null,
  });
});
reducer.case(fetchDeletedCases.async.done, (state, action) => {
  const items = action.result;
  const deletedItemsHash: CasesHash = reduceBy(items, 'id');
  return pureAssign(state, {
    deletedCasesLoading: false,
    deletedCases: deletedItemsHash,
    fetchDeletedCasesError: null,
  });
});
reducer.case(fetchDeletedCases.async.failed, (state, { error }) => {
  return pureAssign(state, {
    fetchDeletedCasesError: error,
    deletedCasesLoading: false,
  });
});
