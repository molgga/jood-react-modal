import { useJdModalRef } from '@draft/jd-modal';
import { PaymentModalData, PaymentModalResult } from './types';
import { usePaymentSettingModal } from './usePaymentSettingModal';

export function PaymentModal() {
  const settingModal = usePaymentSettingModal();
  const modalRef = useJdModalRef<PaymentModalResult, PaymentModalData>();
  const { testPass } = modalRef.data || {};

  const handleSettingModalOpen = () => {
    settingModal.open();
  };

  const handlePaymentModalClose = () => {
    modalRef.close({
      testResult: new Date().toLocaleString(),
    });
  };

  settingModal.onClosed((result) => {
    console.log(result);
  });

  return (
    <div style={{ minWidth: '320px' }}>
      payment modal
      <div style={{ padding: '10px' }}>testPass: {testPass}</div>
      <div style={{ padding: '10px' }}>
        <button onClick={handleSettingModalOpen}>Setting</button>
        <button onClick={handlePaymentModalClose}>Close</button>
      </div>
    </div>
  );
}
