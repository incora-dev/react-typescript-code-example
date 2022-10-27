import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { modifyCase, modifyPatientCustomField, modificationReducer } from './modification';
import { ActionType } from './actions';
import { CaseStatus } from '../../constants/case';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const initialCases = {
	cases: {
		'36209cc0-dfcf-4260-a1e3-8a14ebe725a1': {
			patient: {
				id: 'fe22b8f1-25ee-45b0-904a-9fed163fa265',
				customFields: [{ fieldName: 'legalStatus', value: 'NA' }],
			},
			id: '36209cc0-dfcf-4260-a1e3-8a14ebe725a1',
			number: 76543,
			status: CaseStatus.OPEN,
			version: 723,
		},
	},
	deletedCases: {},
	error: null,
	loading: false,
	deletedCasesLoading: false,
	caseHistoryLoading: false,
	fetchDeletedCasesError: null,
	fetchCaseHistoryError: null,
	syncing: false,
	caseHistory: [],
};
const initialState = {
	cases: initialCases,
};

describe('modifyPatientCustomField', () => {
	it('should create MODIFY_PATIENT_CUSTOM_FIELD', () => {
		const expectedActions = [
			{
				type: `@cases/${ActionType.MODIFY_PATIENT_CUSTOM_FIELD}_STARTED`,
				payload: {
					caseId: '36209cc0-dfcf-4260-a1e3-8a14ebe725a1',
					customField: { fieldName: 'legalStatus', value: 'Aboriginal' },
				},
			},
			{
				type: `@cases/${ActionType.MODIFY_CASE}`,
				payload: {
					id: '36209cc0-dfcf-4260-a1e3-8a14ebe725a1',
					changedProps: {
						patient: {
							customFields: [{ fieldName: 'legalStatus', value: 'Aboriginal' }],
						},
					},
				},
			},
			{
				type: `@cases/${ActionType.MODIFY_PATIENT_CUSTOM_FIELD}_DONE`,
				payload: {
					params: {
						caseId: '36209cc0-dfcf-4260-a1e3-8a14ebe725a1',
						customField: { fieldName: 'legalStatus', value: 'Aboriginal' },
					},
					result: undefined,
				},
			},
		];

		const store = mockStore(initialState);
		return store
			.dispatch(
				modifyPatientCustomField({
					caseId: '36209cc0-dfcf-4260-a1e3-8a14ebe725a1',
					customField: { fieldName: 'legalStatus', value: 'Aboriginal' },
				}) as any
			)
			.then(() => {
				expect(store.getActions()).toEqual(expectedActions);
			});
	});

	it('should create MODIFY_CASE', () => {
		const expectedActions = [
			{
				type: `@cases/${ActionType.MODIFY_CASE}`,
				payload: {
					id: '36209cc0-dfcf-4260-a1e3-8a14ebe725a1',
					changedProps: {
						patient: {
							customFields: [{ fieldName: 'legalStatus', value: 'Aboriginal' }],
						},
					},
				},
			},
		];

		const store = mockStore(initialState);
		store.dispatch(
			modifyCase({
				id: '36209cc0-dfcf-4260-a1e3-8a14ebe725a1',
				changedProps: {
					patient: {
						customFields: [{ fieldName: 'legalStatus', value: 'Aboriginal' }],
					},
				},
			}) as any
		);
		expect(store.getActions()).toEqual(expectedActions);
	});

	it('should handle modificationReducer', () => {
		const expectedState = {
			cases: {
				'36209cc0-dfcf-4260-a1e3-8a14ebe725a1': {
					patient: {
						id: 'fe22b8f1-25ee-45b0-904a-9fed163fa265',
						customFields: [{ fieldName: 'legalStatus', value: 'Aboriginal' }],
						syncStatus: undefined,
					},
					id: '36209cc0-dfcf-4260-a1e3-8a14ebe725a1',
					number: 76543,
					status: 'OPEN',
					version: 724,
					syncStatus: 1,
				},
			},
			fetchDeletedCasesError: null,
			deletedCases: {},
			error: null,
			loading: false,
			deletedCasesLoading: false,
			caseHistoryLoading: false,
			syncing: false,
			caseHistory: [],
			fetchCaseHistoryError: null,
		};
		const realState = modificationReducer(initialCases, {
			type: `@cases/${ActionType.MODIFY_CASE}`,
			payload: {
				id: '36209cc0-dfcf-4260-a1e3-8a14ebe725a1',
				changedProps: {
					patient: {
						customFields: [{ fieldName: 'legalStatus', value: 'Aboriginal' }],
					},
				},
			},
		} as any);
		const timeDiff = new Date().getTime() - new Date(realState.cases['36209cc0-dfcf-4260-a1e3-8a14ebe725a1'].timeLastUpdate || 0).getTime();
		expect(timeDiff).toBeGreaterThanOrEqual(0);
		expect(timeDiff).toBeLessThanOrEqual(1);
		delete realState.cases['36209cc0-dfcf-4260-a1e3-8a14ebe725a1'].timeLastUpdate;
		realState.cases['36209cc0-dfcf-4260-a1e3-8a14ebe725a1'].patient && delete realState.cases['36209cc0-dfcf-4260-a1e3-8a14ebe725a1'].patient.timeLastUpdate;
		expect(realState).toEqual(expectedState);
	});
});
