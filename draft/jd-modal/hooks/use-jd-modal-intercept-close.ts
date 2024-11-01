import { useEffect, useRef } from 'react';
import type { Subscription } from 'rxjs';
import type { JdModalRef } from '../core/jd-modal-ref';

type ClosedCallback<R = unknown> = (result?: R) => void;

/**
 * 모달 닫힐때 결과 받기용
 */
export const useJdModalInterceptClose = <R = unknown>() => {
  const closeListener = useRef<Subscription | null>(null);
  const fnClosed = useRef<ClosedCallback<R>>(() => false);

  const handleClosed = (result?: R) => {
    fnClosed.current(result);
  };

  /**
   * modalRef 옵저버 등록
   */
  const intercept = (modalRef: JdModalRef) => {
    closeListener.current = (modalRef as JdModalRef<R>)
      .observeClosed()
      .subscribe(handleClosed);
  };

  /**
   * 닫힘 콜백
   */
  const onClosed = (callback: ClosedCallback<R>) => {
    fnClosed.current = callback;
  };

  const dispose = () => {
    if (closeListener.current) {
      closeListener.current.unsubscribe();
      closeListener.current = null;
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
