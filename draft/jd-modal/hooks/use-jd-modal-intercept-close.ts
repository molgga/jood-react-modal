import { useEffect, useRef } from 'react';
import { Subscription } from 'rxjs';
import { JdModalRef } from '../core/jd-modal-ref';

type ClosedCallback<R = any> = (result?: R) => void;

/**
 * 모달 닫힐때 결과 받기용
 */
export const useJdModalInterceptClose = <R = any>() => {
  let interceptModalRef: JdModalRef | null = null;
  let closeListener: Subscription | null = null;
  const fnClosed = useRef<ClosedCallback<R>>(() => false);

  const handleClosed = (result?: R) => {
    fnClosed.current(result);
  };

  /**
   * modalRef 옵저버 등록
   */
  const intercept = (modalRef: JdModalRef) => {
    interceptModalRef = modalRef;
    closeListener = interceptModalRef.observeClosed().subscribe(handleClosed);
  };

  /**
   * 닫힘 콜백
   */
  const onClosed = (callback: ClosedCallback<R>) => {
    fnClosed.current = callback;
  };

  /**
   * 해제
   */
  const dispose = () => {
    if (closeListener) {
      closeListener.unsubscribe();
      closeListener = null;
    }
  };

  useEffect(() => {
    return () => {
      dispose();
    };
  }, []);

  return {
    intercept,
    onClosed,
  };
};
