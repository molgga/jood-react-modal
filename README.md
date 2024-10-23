# WIP

...리액트용 모달 정리중...

Vue3 용과 사용법 동일: https://molgga.github.io/jood-v-modal

```tsx
// ... Root
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
function PageComponent() {
  const modalA = useSampleModalA();
  const modalB = useSampleModalB();

  const handleOpenSampleA = () => {
    modalA.open();
  };

  const handleOpenSampleB = () => {
    modalB.open();
  };

  // 결과받기
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
```

```tsx
// ... 모달
import {
  SampleModal,
  SampleModalData,
  SampleModalResult,
} from '../ui/sample-modal';
import {
  StackRight,
  useJdModalInterceptClose,
  useJdModalService,
} from '@/shared/libs/jd-modal';

export interface SampleModalData {
  testPass?: string;
}

export interface SampleModalResult {
  testResult?: string;
}

export const useSampleModalB = () => {
  const modalService = useJdModalService();
  const interceptClose = useJdModalInterceptClose<SampleModalResult>();
  const open = (data?: SampleModalData) => {
    const modalRef = modalService.open({
      data,
      component: <SampleModal />, // 모달로 여는 컴포넌트
      openStrategy: new StackRight(), // 모달 여는 방식 결정
      floatingMode: true,
      overlayClose: true,
    });
    interceptClose.intercept(modalRef);
  };
  return {
    open,
    onClosed: interceptClose.onClosed, // 닫힐 때 결과 전달 받는 기능
  };
};
```

```tsx
// ... 모달 - 컴포넌트
import { useJdModalRef } from '@/shared/libs/jd-modal';

export function SampleModal() {
  const modalRef = useJdModalRef<SampleModalResult, SampleModalData>();
  const { testPass } = modalRef.data || {}; // 모달 열릴 때 전달한 값

  const handleCancel = () => {
    modalRef.close({ testResult: 'cancel!' }); // 모달 닫으면서 전달
  };

  const handleSave = () => {
    modalRef.close({ testResult: 'saved!' }); // 모달 닫으면서 전달
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
