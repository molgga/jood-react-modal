import {
  useJdModalService,
  useJdModalInterceptClose,
  StackRight,
} from '@draft/jd-modal';
import { PaymentModal } from './PaymentModal';
import type { PaymentModalData, PaymentModalResult } from './types';

export const usePaymentModal = () => {
  const modalService = useJdModalService();
  const interceptClose = useJdModalInterceptClose<PaymentModalResult>();
  const open = (data?: PaymentModalData) => {
    const modalRef = modalService.open({
      data,
      component: <PaymentModal />, // 모달로 여는 컴포넌트
      openStrategy: new StackRight(), // 모달 여는 방식 결정
      overlayClose: true,
      floatingMode: true,
    });
    interceptClose.intercept(modalRef); // modalRef 의 닫는 상태 구독(rxjs)
  };

  return {
    open,
    onClosed: interceptClose.onClosed, // 위에 구독한것 간편하게 콜백으로 제공
  };
};
