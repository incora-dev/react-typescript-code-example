import { reduceBy } from '@app/utils/helpers';
import { getCasesData } from '@app/utils/mockData';
import { IState, ICasesState, initialState } from './reducer';
import { casesSelector, caseSelectorFactory } from './selectors';
import { CasesHash } from './constants';

const getState = (casesHash?: CasesHash): IState => {
	const caseModuleState: ICasesState = {
		...initialState,
		cases: casesHash || reduceBy(getCasesData(), 'id'),
	};
	const userModuleState = {
		session: null,
		license: null,
		config: null,
		billing: null,
		loading: false,
		error: null,
	};
	return { cases: caseModuleState, user: userModuleState, overlays: {} };
};

describe('Cases.caseSelectorFactory', () => {
	it('should create selector that returns specific item', () => {
		const state = getState();
		const casesHash = casesSelector(state);
		const targetCase = Object.values(casesHash)[1];

		const caseSelector = caseSelectorFactory(targetCase.id);
		expect(caseSelector(state)).toBe(targetCase);
	});
});
