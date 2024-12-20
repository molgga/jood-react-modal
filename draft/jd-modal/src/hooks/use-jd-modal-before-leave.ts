import { useCallback, useEffect, useRef } from 'react';
import { historyState } from '../module/history-strategy';
import type { ModalPopStateEvent } from '../module/history-strategy';
import { useJdModalRef } from '../provider/use-jd-modal-ref';
import { useJdModalService } from '../provider/use-jd-modal-service';
import { delay } from '../utils';

type FnPrevent = () => boolean;

interface JdModalBeforeLeaveProps {
  leaveMessage?: string;
}

/**
 * (ver.2)
 * 모달의 beforeLeave 기능 훅.
 * - leave 컨펌 여부는 onPrevent 콜백에서 결정한다.
 *  - async 는 지원하지 않는다.
 *  - true 시 컨펌 확인 과정을 진행한다.
 * - 커스텀 컨펌창은 더이상 지원하지 않고, 기본 window.confirm 을 사용한다.
 * - historyStrategy 사용 여부에 처리가 다르다.
 *  - true 인 경우 해당 훅에서 history 이벤트 핸들러에서 confirm 체크를 한다.
 *  - false 인 경우 modalRef 에서 close 전처리로 confirm 체크를 한다.
 * - pullDownClose 로 닫는 경우에는 beforeLeave 는 해제된다.
 */
export const useJdModalBeforeLeave = (props?: JdModalBeforeLeaveProps) => {
  let { leaveMessage = '모달을 닫으시겠습니까?' } = props || {};
  const modalService = useJdModalService();
  const modalRef = useJdModalRef();
  const fnPrevent = useRef<FnPrevent>(() => false);
  const fnDetachBeforeLeave = useRef<typeof detachBeforeLeave>();
  const holdBeforeLeave = useRef<boolean>(false);

  const setLeaveMessage = (message: string) => {
    leaveMessage = message;
  };

  const onPrevent = (fn: FnPrevent) => {
    fnPrevent.current = fn;
  };

  // 모달 나가기 핸들
  const onBeforeUnloadModal = useCallback(
    async (evt: ModalPopStateEvent) => {
      const { current: modalCurrentId } = historyState.getStateOfEvent(
        modalService.id,
        evt
      );
      const isTop = modalService.isModalRefTop(modalRef.id);
      if (!isTop) return;
      if (modalCurrentId === modalRef.id) return;

      const isPrevent = fnPrevent.current();
      // 컨펌창 때문에 hold 체크, 에디터 변경사항 체크
      if (!holdBeforeLeave.current) {
        if (isPrevent) {
          holdBeforeLeave.current = true;
          evt._preventModalClose = true;
          history.forward(); // 브라우저는 이미 뒤로가기가 되어서 다시 forwad 시킴.
          await delay(100);
          const confirm = window.confirm(leaveMessage); // async 지원시 사용 방법이 복잡해져서 기본 confirm 사용
          if (!confirm) {
            holdBeforeLeave.current = false;
          } else {
            fnDetachBeforeLeave.current?.();
            modalRef.close();
          }
        } else {
          fnDetachBeforeLeave.current?.();
          modalRef.close();
        }
      }
    },
    [modalService, holdBeforeLeave, leaveMessage, modalRef]
  );

  // 브라우저 핸들
  const onBeforeUnloadBrowser = useCallback(
    (evt: Event) => {
      const isPrevent = fnPrevent.current();
      if (isPrevent) {
        evt.preventDefault();
        return leaveMessage;
      }
    },
    [fnPrevent, leaveMessage]
  );

  const detachBeforeLeave = useCallback(() => {
    modalRef.detachBeforeLeave();
    window.removeEventListener('popstate', onBeforeUnloadModal);
    window.removeEventListener('beforeunload', onBeforeUnloadBrowser);
  }, [modalRef, onBeforeUnloadModal, onBeforeUnloadBrowser]);

  const attachBeforeLeave = useCallback(() => {
    if (modalRef.isAttachedBeforeLeave) return;
    detachBeforeLeave();
    window.addEventListener('beforeunload', onBeforeUnloadBrowser);
    window.addEventListener('popstate', onBeforeUnloadModal);
    const enabledHistoryStrategy = modalService.enabledHistoryStrategy;
    modalRef.attachBeforeLeave({
      enabledHistoryStrategy,
      beforeLeaveMessage: leaveMessage,
      onPrevent: () => fnPrevent.current?.(),
      forceDetachBeforeLeave: () => {
        try {
          window.removeEventListener('popstate', onBeforeUnloadModal);
          window.removeEventListener('beforeunload', onBeforeUnloadBrowser);
        } catch (err) {
          //
          console.warn(err);
        }
      },
    });
  }, [
    modalRef,
    modalService.enabledHistoryStrategy,
    leaveMessage,
    detachBeforeLeave,
    onBeforeUnloadBrowser,
    onBeforeUnloadModal,
  ]);

  useEffect(() => {
    attachBeforeLeave();
    fnDetachBeforeLeave.current = detachBeforeLeave;
    return () => {
      detachBeforeLeave();
    };
  }, [attachBeforeLeave, detachBeforeLeave]);

  return {
    onPrevent,
    setLeaveMessage,
    attachBeforeLeave,
    detachBeforeLeave,
  };
};
