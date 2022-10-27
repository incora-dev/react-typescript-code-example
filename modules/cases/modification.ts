import pureAssign from 'pure-assign';
import { omitProps, getById } from '@app/utils/helpers';
import apiRequest from '@app/utils/request';
import { EditableBilling } from '@app/constants/billing';
import {
  ICase,
  ICaseApi,
  EditableCase,
  EditableCaseProp,
  CaseStatus,
  caseTimings,
} from '@app/constants/case';
import { EditablePatient } from '@app/constants/patient';
import { EditablePrimary } from '@app/constants/primarySurvey';
import { EditableSecondary } from '@app/constants/secondarySurvey';
import { EditableTransport } from '@app/constants/transport';
import { SyncStatus } from '@app/constants/global';
import { reducer } from './reducer';
import { ActionType, createAction } from './actions';
import {
  getNextVersion,
  validateCaseTimings,
  validateTreatsOnCaseUpdate,
} from './utils';
import { formatCase } from './utils';
import { parseCase } from './utils';
import { EditableHospital } from '@app/constants/hospital';

// ------------------------
// Requests
// ------------------------
export const putCase = async (
  caseItem: ICase,
  caseVersion: number
): Promise<ICase> => {
  const preparedCase =
    caseItem.version !== caseVersion
      ? { ...caseItem, version: caseVersion }
      : caseItem;
  const data = formatCase(preparedCase, true);
  const response = await apiRequest<ICaseApi>({
    url: `/case/${caseItem.id}`,
    method: 'put',
    params: { caseVersion },
    data,
  });
  return parseCase(response.data);
};

export const restoreCase = async (caseId: string): Promise<void> => {
  await apiRequest<void>({ url: `/case/undelete/${caseId}`, method: 'put' });
};

// ------------------------
// Actions & reducers
// ------------------------

type CaseChangedProps = Partial<
  EditableCase & { patient: EditablePatient } & {
    primarySurvey: EditablePrimary;
  } & { secondarySurvey: EditableSecondary } & {
    caseTransport: EditableTransport;
  } & {
    hospital: EditableHospital;
  } & { caseBilling: EditableBilling }
>;
export const modifyCase = createAction<{
  id: string;
  changedProps: CaseChangedProps;
}>(ActionType.MODIFY_CASE);
reducer.case(modifyCase, (state, props) => {
  const { id: caseId, changedProps } = props;
  const currentCase = getById(state.cases, caseId);
  if (!currentCase || !Object.keys(changedProps).length) return state;
  const setNestingSyncStatus = false;

  const now = new Date();
  const changedCaseRootProps: EditableCase = omitProps(
    changedProps,
    'hospital',
    'patient',
    'primarySurvey',
    'secondarySurvey',
    'caseTransport'
  );
  const changedCaseRootKeys = Object.keys(
    changedCaseRootProps
  ) as EditableCaseProp[];
  const rootCaseChanged = changedCaseRootKeys.length > 0;
  let nextCase: ICase = {
    ...currentCase,
    ...changedCaseRootProps,
    timeLastUpdate: now.toISOString(),
    version: getNextVersion(currentCase),
  };
  if (rootCaseChanged || !setNestingSyncStatus) {
    nextCase.syncStatus = currentCase.syncStatus || SyncStatus.EDITED_PENDING; // Preserve current syncStatus if not synced yet
  }
  if (nextCase.sessionLastUpdate) nextCase.sessionLastUpdate = undefined; // Reset sessionLastUpdate
  if (rootCaseChanged) {
    if (changedCaseRootProps.status === CaseStatus.CLOSED) {
      // Case was closed
      nextCase.timeClose = now.toISOString();
    }
    if (changedCaseRootProps.caseDate) {
      // Validate timings sequence
      nextCase = validateCaseTimings(nextCase, currentCase.caseDate);
    }
    caseTimings.forEach((timingKey) => {
      if (
        changedCaseRootProps.caseDate ||
        changedCaseRootKeys.includes(timingKey)
      ) {
        nextCase.treatments = validateTreatsOnCaseUpdate(nextCase, timingKey);
      }
    });
  }

  return pureAssign(state, {
    cases: {
      ...state.cases,
      [caseId]: nextCase,
    },
  });
});

export const modificationReducer = reducer;
