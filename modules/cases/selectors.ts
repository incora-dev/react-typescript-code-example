import { createSelector } from 'reselect';
import { getById } from '@app/utils/helpers';
import { ICase } from '@app/constants/case';
import { PatientFormFields } from '@app/constants/patient';
import { IState } from './reducer';
import { getVisibleCases } from './getters';

const moduleState = (state: IState) => state.cases;

export const loadingSelector = (state: IState) => moduleState(state).loading;
export const deletedLoadingSelector = (state: IState) =>
  moduleState(state).deletedCasesLoading;
export const caseErrorSelector = (state: IState) => moduleState(state).error;
export const deletedCasesErrorSelector = (state: IState) =>
  moduleState(state).fetchDeletedCasesError;

export const casesSelectorAll = (state: IState) => moduleState(state).cases;
export const deletedCasesSelector = (state: IState) =>
  moduleState(state).deletedCases;
export const casesSelector = createSelector(casesSelectorAll, getVisibleCases);
export const caseSelector = (caseId: string) => (state: IState) => {
  const activeCase = getById(casesSelector(state), caseId);
  if (activeCase) return activeCase;
  return getById(deletedCasesSelector(state), caseId);
};

const getCaseSubComplete = <T extends Record<string, any>>(
  subObject: T | undefined,
  formFields: (keyof T)[],
  considerFalseAsNull = false
): boolean => {
  if (!subObject) return false;
  const notNullProp = formFields.find((propName) => {
    const value = subObject[propName] as any;
    const isNull =
      value === undefined ||
      value === null ||
      value === '' ||
      (considerFalseAsNull ? value === false : false);
    return !isNull;
  });
  return notNullProp !== undefined;
};

export const getCasePatientTabChecked = (
  caseItem?: ICase,
  includeKin?: boolean
) => {
  const keys = Object.values(PatientFormFields);
  const targetKeys =
    includeKin === undefined
      ? keys
      : keys.filter((key) =>
          includeKin ? key.indexOf('kin') === 0 : key.indexOf('kin') !== 0
        );
  return getCaseSubComplete(caseItem?.patient, targetKeys);
};
export const casePatientTabCheckedSelector =
  (caseId: string) => (state: IState) =>
    getCasePatientTabChecked(caseSelector(caseId)(state));
