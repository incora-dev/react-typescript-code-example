import { Dispatch } from 'redux';
import { resetUserModule, sessionIdSelector } from '@app/modules/user';
import { resetLayoutModule } from '@app/modules/layout';
import { getClient, IMessageListeners } from '@app/utils/apiClient';
import { isString } from '@app/utils/helpers';
import apiConfig from '@app/configs/api/api.config';
import { ThunkStore } from '@app/constants/global';
import { fetchCase } from './fetching';
import { setCaseItem } from './setting';
import { eraseCase } from './deletion';
import { parseCase } from './utils';
import { resetCasesModule } from './actions';
import { IState } from './reducer';

const listeners: IMessageListeners<IState> = {
  // Cases:
  async ['/case/create'](message, store) {
    const { case: apiCaseItem, caseId, sessionId } = JSON.parse(message.body);
    if (!store || sessionId === sessionIdSelector(store.getState())) return;
    const caseItem = apiCaseItem
      ? parseCase(apiCaseItem)
      : await fetchCase(caseId);
    store.dispatch(setCaseItem({ caseItem, sessionId }));
  },
  async ['/case/update'](message, store) {
    const { case: apiCaseItem, caseId, sessionId } = JSON.parse(message.body);
    if (!store || sessionId === sessionIdSelector(store.getState())) return;
    const caseItem = apiCaseItem
      ? parseCase(apiCaseItem)
      : await fetchCase(caseId);
    store.dispatch(setCaseItem({ caseItem, sessionId }));
  },
  ['/case/delete'](message, store) {
    const {
      case: apiCaseItem,
      caseId: apiCaseId,
      sessionId,
    } = JSON.parse(message.body);
    if (!store || sessionId === sessionIdSelector(store.getState())) return;
    const caseId = apiCaseItem ? parseCase(apiCaseItem).id : apiCaseId;
    if (isString(caseId)) store.dispatch(eraseCase({ caseId }));
  },
};

export const apiClient = getClient<IState>(
  '/websocket/case',
  apiConfig.enableLive ? listeners : {}
);

export const configureApiClient = (store: ThunkStore<IState>) => {
  apiClient.setStore(store);
};

apiClient.addEventListener('onUnAuth', (store) => {
  if (store) unAuthCallback(store.dispatch);
});

export const unAuthCallback = async (dispatch: Dispatch) => {
  apiClient.disconnect();
  const expiredError = new Error(
    'Your authentication expired.\nPlease log in.'
  );
  expiredError.name = 'UserIssue';
  dispatch(resetUserModule({ error: expiredError }));
  dispatch(resetCasesModule());
  dispatch(resetLayoutModule());
};
