import { useState } from 'react';
import {
  useJdModalBeforeLeave,
  useJdModalPullDownClose,
  useJdModalRef,
} from '@draft/jd-modal';
import { NestedModalData, NestedModalResult } from './types';

export function PaymentNestedModal() {
  console.log('PaymentNestedModal');
  // useJdModalPullDownClose();

  // const { onPrevent: onBeforeLeaveCheck } = useJdModalBeforeLeave();
  // onBeforeLeaveCheck(() => {
  //   return true; // true - before leave
  // });

  const modalRef = useJdModalRef<NestedModalResult, NestedModalData>();
  const [isChecked1, setIsChecked1] = useState(false);
  const [isChecked2, setIsChecked2] = useState(false);

  const handlePaymentModalClose = () => {
    modalRef.close({ isChecked1, isChecked2 });
  };

  return (
    <div style={{ width: '320px' }}>
      setting
      <div style={{ padding: '10px' }}>
        <label>
          <input
            type="checkbox"
            onChange={(evt) => setIsChecked1(evt.target.checked)}
          />
          <span>isChecked1</span>
        </label>
        <label>
          <input
            type="checkbox"
            onChange={(evt) => setIsChecked2(evt.target.checked)}
          />
          <span>isChecked2</span>
        </label>
      </div>
      <div style={{ padding: '10px' }}>
        <button onClick={handlePaymentModalClose}>Close</button>
      </div>
    </div>
  );
}
