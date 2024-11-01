import * as historyState from './history-state';
import type {
  HistoryEntryConfig,
  HistoryStarategy,
  ModalPopStateEvent,
} from './types';

/**
 * state 형 history stack
 */
export class HistoryStateStrategy implements HistoryStarategy {
  createEntry(config: HistoryEntryConfig) {
    const { modalService, modalRef } = config;
    let historyTouched = false;

    const touch = () => {
      historyState.touch(modalService.id, modalRef.id);
      historyTouched = true;
      window.addEventListener('popstate', handleLocationHash);
    };

    const pop = () => {
      window.removeEventListener('popstate', handleLocationHash);
      if (!historyTouched) return;
      const { current } = historyState.getStateOfHistory(modalService.id);
      if (current === modalRef.id) {
        // if (current === modalRef.id || (before === null && current === null)) {
        window.history.back();
      }
    };

    const handleLocationHash = (evt: ModalPopStateEvent) => {
      if (evt._preventModalClose) return;
      if (!historyTouched) return;
      const isTop = modalService.isModalRefTop(modalRef.id);
      const { current } = historyState.getStateOfHistory(modalService.id);
      if (!isTop) return;
      let useClose = false;
      if (current && current < modalRef.id) {
        useClose = true;
      }
      if (useClose) {
        modalRef.close();
      }
    };

    return {
      touch,
      pop,
    };
  }
}
