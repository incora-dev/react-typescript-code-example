import uuid from 'uuid/v4';
import pureAssign from 'pure-assign';
import { push } from 'connected-react-router';
import apiRequest from '@app/utils/request';
import { resetDay } from '@app/utils/dateUtils';
import {
  restrictDispatch,
  currentSessionSelector,
  currentLicenseSelector,
} from '@app/modules/user';
import { Overlay, openOverlay } from '@app/modules/overlays';
import { SyncStatus } from '@app/constants/global';
import { ICase, ICaseApi, CaseStatus, CaseType } from '@app/constants/case';
import { CaseCategoriesTuple } from '@app/constants/treatment';
import { ClientType } from '@app/constants/user';
import Routes from '@app/constants/routes';
import { ActionType, createAction, createAsyncAction } from './actions';
import { reducer } from './reducer';
import { formatCase, parseCase } from './utils';

// ------------------------
// Requests
// ------------------------
export const postCase = async (caseItem: ICase): Promise<ICase> => {
  const data = formatCase(caseItem);
  const response = await apiRequest<ICaseApi>({
    url: '/case',
    method: 'post',
    params: { caseVersion: caseItem.version },
    data,
  });
  return parseCase(response.data);
};

// ------------------------
// Actions & reducers
// ------------------------
export const caseCreationIntent = createAsyncAction<
  { categories: CaseCategoriesTuple; caseNumber?: number },
  void
>(
  ActionType.CREATE_CASE_INTENT,
  ({ categories, caseNumber }, dispatch, getState) => {
    const state = getState();
    const { username: userName, scope: accessScopes } =
      currentSessionSelector(state);
    const { clientType } = currentLicenseSelector(state);
    const isHospital = clientType === ClientType.CLIENT_FIELD_HOSPITAL;
    const createImmediately = !!caseNumber || isHospital;
    if (createImmediately) {
      const caseId = uuid();
      dispatch(
        createCase({
          id: caseId,
          number: caseNumber,
          userName,
          categories,
          clientType,
        })
      );
      const route = isHospital ? '/view/edit/patient' : '';
      dispatch(push(`${Routes.CASE.replace(':id', caseId)}${route}`));
    } else {
      restrictDispatch(
        dispatch,
        'case:create',
        accessScopes
      )(openOverlay(Overlay.NEW_CASE_DIALOG));
    }
  }
);

export const createCase = createAction<{
  id: string;
  number?: number;
  userName?: string;
  categories: CaseCategoriesTuple;
  clientType: ClientType;
}>(ActionType.CREATE_CASE);
reducer.case(
  createCase,
  (state, { id, number, userName, categories, clientType }) => {
    const now = new Date();
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const caseItem: ICase = {
      // Internal props:
      id,
      timeCreate: now.toISOString(),
      timeLastUpdate: now.toISOString(),
      version: 0,
      syncStatus: SyncStatus.CREATED_PENDING,
      createdByName: userName,
      realm: 'NORMAL',
      timezone,
      // Form values:
      number,
      status: CaseStatus.OPEN,
      type:
        clientType === ClientType.CLIENT_FIELD_HOSPITAL
          ? CaseType.FIELD_HOSPITAL
          : CaseType.PREHOSPITAL,
      caseDate: resetDay(now).toISOString(),
    };
    return pureAssign(state, {
      cases: {
        ...state.cases,
        [caseItem.id]: caseItem,
      },
    });
  }
);
