# WIP

...리액트용 모달 정리중...

Vue3 용과 사용법 동일: https://molgga.github.io/jood-v-modal

## 사용방법 예시

```tsx
// app 라우터 - 모달 context
'use client';
import { useEffect, useState } from 'react';
import {
  HistoryStateStrategy,
  JdModalProvider,
  JdModalService,
} from '@web/shared/libs/jd-modal';

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
```

```tsx
// app 라우터 - layout.tsx
export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html>
      <body>
        <ModalProvider>{children}</ModalProvider>
      </body>
    </html>
  );
}
```

```tsx
// pages 라우터
export default function App({ Component, pageProps }: NextAppProps) {
  const [modalService] = useState(() => new JdModalService());
  const getLayout = Component.getLayout ?? (({ page }) => page);
  useEffect(() => {
    modalService.setHistoryStrategy(new HistoryStateStrategy());
    modalService.setEnableHistoryStrategy(true);
    modalService.setEnableBlockBodyScroll(true);
    modalService.init();
  }, [modalService]);
  return (
    <JdModalProvider value={modalService}>
      <div>{getLayout({ page: <Component {...pageProps} /> })}</div>
    </JdModalProvider>
  );
}
```

```tsx
// 모달 여는곳 컴포넌트
function SomePage() {
  const paymentModal = useSampleModalPayment();
  const handleOpen = () => {
    paymentModal.open({ myData: 'foo' });
  };

  // 모달 닫을 때 결과 받기
  paymentModal.onClosed((result) => {
    console.log('paymentModal result', result?.testResult);
  });
  return <button onClick={handleOpen}>모달 열기</button>;
}
```

```tsx
// 모달 내용 컴포넌트
export function PaymentModal() {
  // context api 로 modalRef(모달 기능, 넘기능 정보 등을 관리하는 객체)는 주입되어 있음
  const modalRef = useJdModalRef<PaymentModalResult, PaymentModalData>();

  const modalClose = (result) => {
    modalRef.close({ myResult: result }); // 모달 닫으면서 결과 전달
  };
  return (
    <div>
      <div>열 때 전달한 값: {modalRef.data?.myData}</div>
      <button onClick={modalClose('ok')}>확인</button>
    </div>
  );
}
```

```tsx
// 모달 훅 작성 예시
import {
  useJdModalService, // 모달 서비스를 사용하기 위한 훅
  useJdModalInterceptClose, // 모달 닫을 때 결과 전달 구독을 간단하게 사용하기 위한 훅
  StackRight, // 오른쪽에서 열기 예
} from '@/shared/libs/jd-modal';

export interface PaymentModalData {
  myData?: string;
}

export interface PaymentModalResult {
  myResult?: string;
}

export const useSampleModalPayment = () => {
  const modalService = useJdModalService();
  const interceptClose = useJdModalInterceptClose<PaymentModalResult>(); // 닫기 결과 받기 기능
  const open = (data?: PaymentModalData) => {
    const modalRef = modalService.open({
      data,
      component: <PaymentModal />, // 모달로 여는 컴포넌트
      openStrategy: new StackRight(), // 모달 여는 방식 결정
      floatingMode: true,
      overlayClose: true,
    });
    interceptClose.intercept(modalRef);
  };
  return {
    open,
    onClosed: interceptClose.onClosed,
  };
};
```
