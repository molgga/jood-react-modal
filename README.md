# WIP

...리액트용 모달 정리중...

Vue3 용과 사용법 동일: https://molgga.github.io/jood-v-modal

```tsx
// ... Root 에 provider 셋팅하기
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
// ... 모달 여는곳
function SomePage() {
  const paymentModal = useSampleModalPayment();
  const handleOpen = () => {
    paymentModal.open({ myData: 'foo' });
  };
  // 모달 닫을 때 전달해주는 결과 받기
  paymentModal.onClosed((result) => {
    console.log('paymentModal result', result?.testResult);
  });

  return <button onClick={handleOpen}>OPEN A</button>;
}
```

```tsx
// ... 모달 훅으로 만들기
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

// 모달 - 훅으로
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

// ... 모달 - 컴포넌트
export function PaymentModal() {
  const modalRef = useJdModalRef<PaymentModalResult, PaymentModalData>();
  const modalClose = (result) => {
    modalRef.close({ myResult: result }); // 모달 닫으면서 결과 전달
  };
  return (
    <div>
      <div>열 때 전달한 값: {modalRef.data?.myData}</div>
      <div>
        <button onClick={modalClose('cancel')}>취소</button>
        <button onClick={modalClose('ok')}>확인</button>
      </div>
    </div>
  );
}
```
