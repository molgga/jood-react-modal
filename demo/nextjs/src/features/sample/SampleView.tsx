'use client';
import { usePaymentModal } from './usePaymentModal';

export function SampleView() {
  const modalPayment = usePaymentModal();

  const handlePaymentModalOpen = () => {
    modalPayment.open({ testPass: new Date().toLocaleString() });
  };

  modalPayment.onClosed((result) => {
    console.log('closed', result);
  });

  return (
    <div>
      <div>sample</div>
      <div>
        <button onClick={handlePaymentModalOpen}>Open</button>
      </div>
    </div>
  );
}
