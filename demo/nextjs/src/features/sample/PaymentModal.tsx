import { useJdModalRef } from '@draft/jd-modal';
import { PaymentModalData, PaymentModalResult } from './types';
import { usePaymentNestedModal } from './usePaymentNestedModal';
import { useState } from 'react';

export function PaymentModal() {
  const modalRef = useJdModalRef<PaymentModalResult, PaymentModalData>();
  const someNestedModal = usePaymentNestedModal();
  const [testNestedResult, setTestNestedResult] = useState('');

  const handleNestedModalOpen = () => {
    someNestedModal.open();
  };

  const handlePaymentModalClose = () => {
    modalRef.close({
      testResult: new Date().toLocaleString(),
    });
  };

  someNestedModal.onClosed((result) => {
    console.log(JSON.stringify(result ?? ''));
    setTestNestedResult(JSON.stringify(result ?? ''));
  });

  return (
    <div style={{ width: '320px' }}>
      payment modal
      <div style={{ padding: '10px' }}>testPass: {modalRef.data?.testPass}</div>
      <div style={{ padding: '10px' }}>
        testNestedResult: {testNestedResult}
      </div>
      <div style={{ padding: '10px' }}>
        <button onClick={handleNestedModalOpen}>Nested</button>
        <button onClick={handlePaymentModalClose}>Close</button>
      </div>
    </div>
  );
}
