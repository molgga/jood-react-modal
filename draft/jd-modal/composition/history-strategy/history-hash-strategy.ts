import * as historyHash from './history-hash';
import type {
  HistoryEntryConfig,
  HistoryEntryHook,
  HistoryStarategy,
  ModalHashChangeEvent,
} from './types';

/**
 * hash 형 history stack
 */
export class HistoryHashStrategy implements HistoryStarategy {
  createEntry(config: HistoryEntryConfig): HistoryEntryHook {
    const { modalRef } = config;

    let hashTouched = false;
    const historyHashId = historyHash.createHashId(modalRef.id);
    const historyHashIdReg = historyHash.createHashIdReg(historyHashId);

    const touch = () => {
      window.location.hash = historyHashId;
      hashTouched = true;
      window.addEventListener('hashchange', handleLocationHash);
    };

    const pop = () => {
      window.removeEventListener('hashchange', handleLocationHash);
      if (!hashTouched) return;
      if (historyHashIdReg.test(window.location.hash)) {
        window.history.back();
      }
    };

    const handleLocationHash = (evt: ModalHashChangeEvent) => {
      if (evt._preventModalClose) return;
      if (!hashTouched) return;
      if (!historyHashIdReg.test(evt.oldURL)) return;
      const oldVer = historyHash.extractHashId(evt.oldURL);
      const newVer = historyHash.extractHashId(evt.newURL);
      let useClose = false;
      if (newVer === null) {
        useClose = true;
      } else if (oldVer === null) {
        useClose = false;
      } else if (newVer < oldVer) {
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
