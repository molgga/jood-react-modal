'use client';
import { useEffect, useState } from 'react';
import {
  HistoryStateStrategy,
  JdModalProvider,
  JdModalService,
} from '@draft/jd-modal';

interface ModalProviderProps {
  children?: React.ReactNode;
}

export function ModalProvider({ children }: ModalProviderProps) {
  const [modalService] = useState(() => new JdModalService());

  useEffect(() => {
    modalService.setHistoryStrategy(new HistoryStateStrategy());
    modalService.setEnableHistoryStrategy(true);
    modalService.setEnableBlockBodyScroll(true);
    modalService.init();
  }, [modalService]);

  return <JdModalProvider value={modalService}>{children}</JdModalProvider>;
}
