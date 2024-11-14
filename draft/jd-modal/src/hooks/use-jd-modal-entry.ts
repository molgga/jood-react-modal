import { useEffect, useMemo, useRef, useState } from 'react';
import { Subscription } from 'rxjs';
import { useJdModalService } from '../provider/use-jd-modal-service';
import {
  ModalEventType,
  type ModalEvent,
  type ModalState,
} from '../core/types';
import type { JdModalRef } from '../core/jd-modal-ref';
import type { OpenStrategyStyleSet } from '../module/open-strategy';
import { createFocusTrap } from './use-jd-modal-focus-trap';

/**
 * modalRef JdModalRef 훅 사용시 전달되어야할 JdModalRef
 */
interface JdModalEntryProps {
  modalRef: JdModalRef;
  index?: number;
}

type RefElement = HTMLDivElement;

/**
 * 모달의 Entry 컴포넌트 기능 훅.
 */
export const useJdModalEntry = (props: JdModalEntryProps) => {
  const modalService = useJdModalService();
  const { modalRef, index: initialModalIndex } = props;
  const {
    openStrategy,
    duration,
    panelStyle,
    overlayClose = false,
    floatingMode = false,
    disableShadow = false,
    fullHeight = false,
  } = modalRef || {};
  const enabledHistoryStrategy = modalService.enabledHistoryStrategy;
  const enabledBlockBodyScroll = modalService.enabledBlockBodyScroll;
  const refModalContainer = useRef<RefElement>(null);
  const refModalPanel = useRef<RefElement>(null);
  const safeTiming = isNaN(duration) || duration < 0 ? 240 : duration;
  const [isOpening, setIsOpening] = useState(false);
  const [isOpened, setIsOpened] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [modalIndex, setModalIndex] = useState(initialModalIndex || 0);
  const [modalLength, setModalLength] = useState(modalService.modals?.length);
  const [focusTrap] = useState(() => createFocusTrap());

  const classes = (() => {
    return { fullHeight };
  })();

  const mergeStyle = (
    styleSet: OpenStrategyStyleSet,
    mergeTarget: OpenStrategyStyleSet
  ) => {
    for (const key in mergeTarget) {
      const k = key as keyof OpenStrategyStyleSet;
      styleSet[k] = Object.assign(styleSet[k] || {}, mergeTarget[k]);
    }
  };

  const styles = useMemo(() => {
    const styleSet: OpenStrategyStyleSet = openStrategy.base(safeTiming);
    if (panelStyle) mergeStyle(styleSet, { pivot: panelStyle });
    if (!disableShadow) mergeStyle(styleSet, openStrategy.shadow());
    if (isOpening && !floatingMode)
      mergeStyle(styleSet, openStrategy.opening());
    if (isOpening && floatingMode) {
      const floatingOpening = openStrategy.floatingOpening();
      const floatingLength = floatingOpening.length;
      const floatingIndex =
        modalLength <= modalIndex + 1
          ? floatingLength - 1
          : Math.max(0, floatingLength - (modalLength - modalIndex));
      mergeStyle(styleSet, floatingOpening[floatingIndex]);
    }
    if (isOpened) mergeStyle(styleSet, openStrategy.opened());
    if (isClosing) mergeStyle(styleSet, openStrategy.closing());
    return styleSet;
  }, [
    isOpening,
    isOpened,
    isClosing,
    modalLength,
    modalIndex,
    floatingMode,
    openStrategy,
    disableShadow,
    panelStyle,
    safeTiming,
  ]);

  const onOverlayClick = () => {
    if (overlayClose) {
      modalRef.close();
    }
  };

  const onOverlayTouchMove = (evt: TouchEvent) => {
    if (enabledBlockBodyScroll) {
      evt.preventDefault();
    }
  };

  useEffect(() => {
    // console.log('useJdModalEntrySetup mounted');
    let listener: Subscription | undefined;
    let animateTimer: NodeJS.Timeout;
    const historyStrategy = modalService.historyStrategy.createEntry({
      modalService,
      modalRef,
    });

    const mountedOpening = () => {
      // state.opening = true;
      setIsOpening(true);
      animateTimer = setTimeout(mountedOpened, safeTiming);
    };

    const mountedOpened = () => {
      if (enabledHistoryStrategy) {
        historyStrategy.touch();
      }
      // state.opened = true;
      setIsOpened(true);
      modalRef.opener.next({ type: ModalEventType.OPENED, modalRef });
    };

    const onChangeModalState = (modalState: ModalState) => {
      setModalLength(modalState.modals.length);

      // 중첩으로 열리거나 닫힐 때 포커스 트랩 처리
      const isTop = modalService.isModalRefTop(modalRef.id);
      if (modalRef.usedFocusTrap) {
        if (isTop) {
          focusTrap.dispose();
          focusTrap.init();
        } else {
          focusTrap.dispose();
        }
      }
    };

    const onChangeOpener = (evt: ModalEvent) => {
      if (evt.type === ModalEventType.OPENED) {
        if (refModalContainer.current) {
          refModalContainer.current.focus();
        }
      } else if (evt.type === ModalEventType.CLOSE) {
        if (enabledHistoryStrategy) {
          historyStrategy.pop();
        }
        setIsOpening(false);
        setIsOpened(false);
        setIsClosing(true);
        animateTimer = setTimeout(() => {
          modalRef.closed();
        }, safeTiming);
      }
    };

    const observeModalState = modalService
      .observeModalState()
      .subscribe(onChangeModalState);
    const observeOpener = modalRef.observeOpener().subscribe(onChangeOpener);
    listener = new Subscription();
    listener.add(observeModalState);
    listener.add(observeOpener);

    if (refModalPanel.current) {
      modalRef.setPanelElement(refModalPanel.current);
    }

    if (modalRef.usedFocusTrap && modalRef.panelElement) {
      focusTrap.setWrapperElement(modalRef.panelElement);
      focusTrap.init();
    }

    modalRef.opener.next({ type: ModalEventType.OPEN, modalRef });
    animateTimer = setTimeout(mountedOpening, 15);

    return () => {
      clearTimeout(animateTimer);
      focusTrap.dispose();
      listener?.unsubscribe();
      listener = undefined;
    };
  }, [modalRef, modalService, safeTiming, focusTrap, enabledHistoryStrategy]);

  return {
    setModalIndex,
    onOverlayClick,
    onOverlayTouchMove,
    refModalContainer,
    refModalPanel,
    classes,
    styles,
  };
};
