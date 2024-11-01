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
    <RootErrorBoundary>
      <JdModalProvider value={modalService}>
        <div>{getLayout({ page: <Component {...pageProps} /> })}</div>
      </JdModalProvider>
    </RootErrorBoundary>
  );
}
```

```tsx
// ... 모달 여는곳
function SomePage() {
  const modalA = useSampleModalPayment(); // 모달 기능을 훅으로 만들기
  const modalB = useSampleModalB();

  const handleOpenSampleA = () => {
    modalA.open({ testPass: 'foo' });
  };

  const handleOpenSampleB = () => {
    modalB.open();
  };

  // 모달 닫을 때 전달해주는 결과 받기
  modalA.onClosed((result) => {
    console.log('modalA result', result?.testResult);
  });

  modalB.onClosed((result) => {
    console.log('modalB result', result?.testResult);
  });

  return (
    <div>
      <button onClick={handleOpenSampleA}>OPEN A</button>
      <button onClick={handleOpenSampleB}>OPEN B</button>
    </div>
  );
}

// ... 동일한 모달 여는 기능이 필요한 다른 어딘가
function LayoutHeader() {
  const modalA = useSampleModalPayment();
  // ...
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
  testPass?: string;
}

export interface PaymentModalResult {
  testResult?: string;
}

// 모달 - 훅으로
export const useSampleModalPayment = () => {
  const modalService = useJdModalService();
  const interceptClose = useJdModalInterceptClose<PaymentModalResult>();
  const open = (data?: PaymentModalData) => {
    const modalRef = modalService.open({
      data,
      component: <PaymentModal />, // 모달로 여는 컴포넌트
      openStrategy: new StackRight(), // 모달 여는 방식 결정
      floatingMode: true,
      overlayClose: true,
    });
    interceptClose.intercept(modalRef); // modalRef 의 닫는 상태 구독(rxjs)
  };

  // 페이지 언마운트 될 때 닫는 예
  // useEffect(() => {
  //   return (() => {
  //     if (modalRef) modalRef.close();
  //   })
  // }, [modalRef]);

  return {
    open,
    onClosed: interceptClose.onClosed, // 위에 구독한것 간편하게 콜백으로 제공
  };
};

// ... 모달 - 컴포넌트
export function PaymentModal() {
  const modalRef = useJdModalRef<PaymentModalResult, PaymentModalData>();
  const { testPass } = modalRef.data || {}; // 모달 여는곳에서 전달해준 값
  const handleCancel = () => {
    modalRef.close({ testResult: 'cancel!' }); // 모달 닫으면서 결과 전달
  };
  const handleSave = () => {
    modalRef.close({ testResult: 'saved!' }); // 모달 닫으면서 결과 전달
  };
  return (
    <div>
      <div>모달 열 때 받은것: {testPass}</div>
      <div>
        <button onClick={handleCancel}>취소</button>
        <button onClick={handleSave}>저장</button>
      </div>
    </div>
  );
}
```
