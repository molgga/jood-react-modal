import {
  useJdModalService,
  useJdModalInterceptClose,
  StackRight,
} from '@draft/jd-modal';
import { PaymentNestedModal } from './PaymentNestedModal';
import type { NestedModalData, NestedModalResult } from './types';

export const usePaymentNestedModal = () => {
  const modalService = useJdModalService();
  const interceptClose = useJdModalInterceptClose<NestedModalResult>();
  const open = (data?: NestedModalData) => {
    const modalRef = modalService.open({
      data,
      component: <PaymentNestedModal />,
      openStrategy: new StackRight(),
      overlayClose: false,
    });
    interceptClose.intercept(modalRef);
  };

  return {
    open,
    onClosed: interceptClose.onClosed,
  };
};
