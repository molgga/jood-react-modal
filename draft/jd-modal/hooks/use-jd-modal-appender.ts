import { useEffect, useMemo, useState } from 'react';
import { Subscription } from 'rxjs';
import { useJdModalService } from '../provider/context';
import { ModalState } from '../core/types';
import { JdModalRef } from '../core/jd-modal-ref';

export const useJdModalAppender = () => {
  const modalService = useJdModalService();
  const [modalRefs, setModalRefs] = useState<JdModalRef[]>(modalService.modals);
  const [isEmptied, setIsEmptied] = useState(true);

  const classes = useMemo(() => {
    return { isEmptied: isEmptied };
  }, [isEmptied]);

  useEffect(() => {
    let animateTimer: any = null;
    const listener = new Subscription();

    const onChangeModalState = (modalState: ModalState) => {
      const { modals } = modalState;
      const hasModal = !!(modals && modals.length);
      setModalRefs(modals);
      clearTimeout(animateTimer);
      animateTimer = null;
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
