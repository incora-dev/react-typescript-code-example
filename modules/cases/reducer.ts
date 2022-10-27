import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { AxiosResponse } from 'axios';
import { IUserState } from '@app/modules/user';
import { IOverlaysState } from '@app/modules/overlays';
import { CasesHash } from './constants';

export interface ICasesError extends Error {
  buttonText?: string;
  dialogCaption?: string;
  response?: AxiosResponse;
}

export interface ICasesState {
  readonly cases: CasesHash;
  readonly deletedCases: CasesHash;
  readonly loading: boolean;
  readonly deletedCasesLoading: boolean;
  readonly error: ICasesError | null;
  readonly fetchDeletedCasesError: Error | null;
}

export const initialState: ICasesState = {
  cases: {},
  deletedCases: {},
  loading: true,
  deletedCasesLoading: true,
  error: null,
  fetchDeletedCasesError: null,
};

export const reducer = reducerWithInitialState(initialState);

export type IState = Record<'cases', ICasesState> &
  Record<'user', IUserState> &
  Record<'overlays', IOverlaysState>;
