import { useEffect, useMemo, useState } from 'react';
import { Subscription } from 'rxjs';
import { useJdModalService } from '../provider/use-jd-modal-service';
import type { ModalState } from '../core/types';
import type { JdModalRef } from '../core/jd-modal-ref';

export const useJdModalAppender = () => {
  const modalService = useJdModalService();
  const [modalRefs, setModalRefs] = useState<JdModalRef[]>(modalService.modals);
  const [isEmptied, setIsEmptied] = useState(true);

  const classes = useMemo(() => {
    return { isEmptied: Boolean(isEmptied) };
  }, [isEmptied]);

  useEffect(() => {
    let animateTimer: NodeJS.Timeout | undefined;
    const listener = new Subscription();

    const onChangeModalState = (modalState: ModalState) => {
      const { modals } = modalState;
      const hasModal = Boolean(modals && modals.length > 0);
      setModalRefs(modals);
      clearTimeout(animateTimer);
      animateTimer = undefined;
      if (hasModal) {
        setIsEmptied(false);
      } else {
        animateTimer = setTimeout(() => {
          setIsEmptied(true);
        }, 140);
      }
    };

    const observeModalState = modalService
      .observeModalState()
      .subscribe(onChangeModalState);
    listener.add(observeModalState);

    return () => {
      listener.unsubscribe();
    };
  }, [modalService]);

  return {
    modalRefs,
    classes,
  };
};
