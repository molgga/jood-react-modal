import { useEffect, useRef, useState } from 'react';
import { Subscription } from 'rxjs';
import { useJdModalService } from '../provider/use-jd-modal-service';
import { useJdModalRef } from '../provider/use-jd-modal-ref';

interface DragConfig {
  initialize?: boolean; // 자동 초기화
  dragResistance?: number; // 드래그 될 때 y 축 움직임 비율(높을수록 적게 움직임. 1 = 1:1, 2 = 1:1/2)
  triggerReleaseGap?: number; // 드래그 후 놨을때 움직인 거리 배수 시간(튕겨서 놓기 시간. 시간이 작을수록 빠르게 터치 start, end 하면 더 많은 거리로 계산 됨)
  triggerReleaseMinY?: number; // 드래그 후 놨을때 닫히는 최소 거리
}

type StateType = ReturnType<
  typeof createState & {
    blindRequestFrame: NodeJS.Timeout | number;
    releaseRequestFrame: NodeJS.Timeout | number;
  }
>;

const createState = () => {
  return {
    startX: 0,
    startY: 0,
    startStamp: 0,
    checkMoveY: 0,
    moveIntercepCount: 0,
    moveY: 0,
    holding: false,
    blindRequestFrame: 0,
    blindMomentum: 0.33,
    blindTargetY: 0,
    releaseRequestFrame: 0,
    releaseMomentum: 0.33,
  };
};

/**
 * 모달 아래로 드래그 해서 닫기
 */
export const useJdModalPullDownClose = (config: DragConfig = {}) => {
  const {
    initialize = true,
    dragResistance = 1,
    triggerReleaseGap = 800,
    triggerReleaseMinY = 100,
  } = config;
  const triggerReleaseMultiple = triggerReleaseGap / 2;
  const moveEventOptions = { passive: false };
  const modalService = useJdModalService();
  const modalRef = useJdModalRef();
  const refScrollContainer = useRef<HTMLElement | null>(null);
  const refPanelElement = useRef<HTMLElement | null>(null);
  const modalListener = useRef<Subscription | null>(null);
  const [state] = useState<StateType>(() => createState());

  // document touchstart
  const onTouchStart = (evt: TouchEvent) => {
    if (!refPanelElement.current) return;
    if (state.holding) return;
    const { clientX, clientY } = evt.touches[0];
    if (refScrollContainer.current) {
      const { scrollTop } = refScrollContainer.current;
      if (scrollTop === 0) {
        releaseFrameStart(clientX, clientY);
      }
    } else {
      releaseFrameStart(clientX, clientY);
    }
  };

  // document touchmove 전 방향 체크. x 축 이동으로 판단하면 onTouchMove 를 하지 않음
  const onTouchMoveIntercept = (evt: TouchEvent) => {
    const { startX, startY } = state;
    const { clientX, clientY } = evt.touches[0];
    const directionX = Math.abs(startX - clientX);
    const directionY = Math.abs(startY - clientY);
    const moveY = clientY - startY;
    state.moveIntercepCount++;
    state.checkMoveY = moveY;
    if (directionX < directionY && moveY > 0) {
      evt.preventDefault();
    }
    if (state.moveIntercepCount > 3) {
      document.removeEventListener('touchmove', onTouchMoveIntercept);
      if (directionX < directionY && moveY > 0) {
        state.startY = clientY;
        document.addEventListener('touchmove', onTouchMove, moveEventOptions);
      }
    }
  };

  // document touchmove
  const onTouchMove = (evt: TouchEvent) => {
    evt.preventDefault();
    const { startY } = state;
    const moveY = evt.touches[0].clientY;
    // state.moveY = (moveY - startY) / dragResistance;
    state.blindTargetY = (moveY - startY) / dragResistance;
    blindFrameClear();
    blindFrameStart();
  };

  // document touchend
  const onTouchEnd = () => {
    blindFrameClear();
    document.removeEventListener('touchmove', onTouchMoveIntercept);
    document.removeEventListener('touchmove', onTouchMove);
    const { startStamp, moveY } = state;
    const triggerY =
      (triggerReleaseGap - (Date.now() - startStamp)) / triggerReleaseMultiple;
    const momentum = Math.max(1, triggerY) * moveY;
    if (triggerReleaseMinY < momentum) {
      modalRef.close();
    } else {
      releaseFrameClear();
      releaseFrameAnimate();
    }
  };

  // 스크롤 컨테이너(DOM) 의 prevent 처리
  const onContainerTouchPrevent = (evt: TouchEvent) => {
    if (state.checkMoveY > 0 && evt.cancelable) {
      evt.preventDefault();
    }
  };

  const updateMoveY = (moveY: number) => {
    const y = Math.max(0, moveY);
    const beforeY = state.moveY;
    state.moveY = moveY;
    if (beforeY !== 0 && beforeY !== y) {
      if (refPanelElement.current) {
        refPanelElement.current.style.transform = `translate3d(0, ${y}px, 0)`;
      }
    }
  };

  /**
   * 이동중 애니메이트 clear
   */
  const blindFrameClear = () => {
    clearTimeout(state.blindRequestFrame);
    cancelAnimationFrame(state.blindRequestFrame);
  };

  /**
   * 이동중 애니메이트 start
   */
  const blindFrameStart = () => {
    state.blindRequestFrame = requestAnimationFrame(blindFrameAnimate);
  };

  /**
   * 이동중 애니메이트
   */
  const blindFrameAnimate = () => {
    const { moveY, blindTargetY, blindMomentum } = state;
    let y = moveY + (blindTargetY - moveY) * blindMomentum;
    if (Math.abs(blindTargetY - y) < 0.05) {
      y = blindTargetY;
    } else {
      state.blindRequestFrame = requestAnimationFrame(blindFrameAnimate);
    }
    updateMoveY(y);
  };

  /**
   * 드래깅 시작
   */
  const releaseFrameStart = (startX: number, startY: number) => {
    releaseFrameClear();
    state.startX = startX;
    state.startY = startY;
    state.startStamp = Date.now();
    state.moveIntercepCount = 0;
    document.removeEventListener('touchmove', onTouchMoveIntercept);
    document.addEventListener(
      'touchmove',
      onTouchMoveIntercept,
      moveEventOptions
    );
  };

  /**
   * 드래깅 클리어
   */
  const releaseFrameClear = () => {
    cancelAnimationFrame(state.releaseRequestFrame);
    state.checkMoveY = 0;
  };

  /**
   * 드래깅 릴리즈 애니메이트
   */
  const releaseFrameAnimate = () => {
    const targetY = 0;
    const { moveY, releaseMomentum } = state;
    const y = moveY + (targetY - moveY) * releaseMomentum;
    updateMoveY(y);
    if (moveY >= 1) {
      state.releaseRequestFrame = requestAnimationFrame(releaseFrameAnimate);
    } else {
      updateMoveY(0);
    }
  };

  // 초기화
  const init = () => {
    refPanelElement.current = modalRef.panelElement;
    refPanelElement.current.style.transition = 'transform 0ms';
    document.addEventListener('touchstart', onTouchStart);
    document.addEventListener('touchend', onTouchEnd);
    if (refScrollContainer.current) {
      refScrollContainer.current.addEventListener(
        'touchmove',
        onContainerTouchPrevent
      );
      refScrollContainer.current.addEventListener(
        'touchend',
        onContainerTouchPrevent
      );
    }
    const observe = modalService.observeModalState().subscribe((modalState) => {
      const modals = modalState.modals;
      state.holding = modalRef.id !== modals[modals.length - 1]?.id;
    });
    modalListener.current = new Subscription();
    modalListener.current.add(observe);
  };

  // 파기
  const destroy = () => {
    blindFrameClear();
    releaseFrameClear();
    document.removeEventListener('touchstart', onTouchStart);
    document.removeEventListener('touchmove', onTouchMoveIntercept);
    document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('touchend', onTouchEnd);
    if (refScrollContainer.current) {
      refScrollContainer.current.removeEventListener(
        'touchmove',
        onContainerTouchPrevent
      );
      refScrollContainer.current.removeEventListener(
        'touchend',
        onContainerTouchPrevent
      );
    }
    modalListener.current?.unsubscribe();
    modalListener.current = null;
  };

  // 강제로 스크롤 컨테이너를 바꿔야 하는 경우가 있을 때 사용.
  const setScrollContainer = (element: HTMLElement) => {
    refScrollContainer.current = element;
  };

  const changeScrollContainer = (element: HTMLElement) => {
    if (refScrollContainer.current) {
      destroy();
    }
    setScrollContainer(element);
    init();
  };

  useInitialEffect(initialize, init, destroy);

  return {
    refScrollContainer,
    init,
    destroy,
    changeScrollContainer,
  };
};

function useInitialEffect(
  initialize: boolean,
  init: () => void,
  destroy: () => void
) {
  useEffect(() => {
    if (initialize) {
      setTimeout(init, 1);
    }
    return () => {
      destroy();
    };
  }, [initialize, init, destroy]);
}
