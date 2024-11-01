import {
  useJdModalService,
  useJdModalInterceptClose,
  StackRight,
} from '@draft/jd-modal';
import { PaymentSettingModal } from './PaymentSettingModal';
import type { PaymentModalData, PaymentModalResult } from './types';

export const usePaymentSettingModal = () => {
  const modalService = useJdModalService();
  const interceptClose = useJdModalInterceptClose<PaymentModalResult>();
  const open = (data?: PaymentModalData) => {
    const modalRef = modalService.open({
      data,
      component: <PaymentSettingModal />,
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
