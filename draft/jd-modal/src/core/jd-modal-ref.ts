import type { CSSProperties } from 'react';
import { Subject } from 'rxjs';
import { StackNormal, type OpenStrategy } from '../module/open-strategy';
import {
  ModalEventType,
  type ModalEvent,
  type ModalData,
  type ComponentType,
  type EntryComponentType,
  type OpenendActiveElement,
} from './types';

/**
 * 하나의 모달 (정보)
 */
export class JdModalRef<
  R = unknown,
  D = unknown,
  C = ComponentType | undefined
> {
  private modalId = -1;
  private modalEntryComponent!: EntryComponentType;
  private modalData: D | undefined;
  private modalResult: R | undefined;
  private modalComponent: C | undefined;
  private modalPanelStyle: unknown;
  private modalOpenStrategy: OpenStrategy;
  private modalTransitionDuration = 240;
  private modalFloatingOpenMode = false;
  private modalOverlayClose = false;
  private modalDisableShadow = false;
  private modalDisableInitAutofocus = false;
  private modalFullHeight = false;
  private modalPanelElement!: HTMLElement;
  private modalOpenedActiveElement!: OpenendActiveElement;
  private modalUsedFocusTrap = true;
  private openerSubject = new Subject<ModalEvent<R, D, C>>();
  private closedSubject = new Subject<R | undefined>();
  private attachedBeforeLeave = false;
  private enabledHistoryStrategy = true;
  private beforeLeaveMessage = '';
  private checkBeforeLeavePrevent = () => false;
  private isModalClose = false;

  constructor() {
    this.modalOpenStrategy = new StackNormal();
  }

  /**
   * 모달의 id
   */
  get id() {
    return this.modalId;
  }

  /**
   * 모달로 전달하는 데이터
   */
  get data() {
    return this.modalData;
  }

  /**
   * 모달 패널의 스타일
   */
  get panelStyle() {
    return this.modalPanelStyle;
  }

  /**
   * 모달로 열리는 컴포넌트
   */
  get component(): C | undefined {
    return this.modalComponent;
  }

  /**
   * 모달을 감싸는(모달 기능, 모션 처리) 컴포넌트
   */
  get entryComponent() {
    return this.modalEntryComponent;
  }

  /**
   * 모달 오픈 방식
   */
  get openStrategy() {
    return this.modalOpenStrategy;
  }

  /**
   * 모달 오픈 속도
   */
  get duration() {
    return this.modalTransitionDuration;
  }

  /**
   * 모달 오버레이 영역 닫기 처리 여부
   */
  get overlayClose() {
    return this.modalOverlayClose;
  }

  /**
   * 모달 중첩 열기시 하위 모달의 UI 처리 여부
   */
  get floatingMode() {
    return this.modalFloatingOpenMode;
  }

  /**
   * 모달 box-shadow 사용 여부
   */
  get disableShadow() {
    return this.modalDisableShadow;
  }

  /**
   * 모달 마운트시 자동 포커스 사용 여부
   */
  get disableInitAutofocus() {
    return this.modalDisableInitAutofocus;
  }

  /**
   * 모달 height 100% 사용 여부
   */
  get fullHeight() {
    return this.modalFullHeight;
  }

  /**
   * 모달의 패널(DOM)
   */
  get panelElement() {
    return this.modalPanelElement;
  }

  /**
   * 모달을 열 때 포커스가 있던 엘리먼트
   */
  get openedActiveElement() {
    return this.modalOpenedActiveElement;
  }

  /**
   * 포커스 트랩 사용여부
   */
  get usedFocusTrap() {
    return this.modalUsedFocusTrap;
  }

  /**
   * 모달 오픈 상태 알리미
   */
  get opener() {
    return this.openerSubject;
  }

  get isAttachedBeforeLeave() {
    return this.attachedBeforeLeave;
  }

  get isClose() {
    return this.isModalClose;
  }

  assignModalData(data: ModalData<D, C>) {
    this.setComponent(data.component);
    this.setOpenStrategy(data.openStrategy || new StackNormal());
    this.setOverlayClose(data.overlayClose || false);
    this.setFloatingModel(data.floatingMode || false);
    this.setFullHeight(data.fullHeight || false);
    this.setDisableShadow(Boolean(data.disableShadow));
    this.setDisableInitAutofocus(Boolean(data.disableInitAutofocus));
    this.setDuration(data.duration || 240);
    this.setData(data.data);
    this.setPanelStyle(data.panelStyle);
    this.setOpenedActiveElement(data.openedActiveElement);
    this.setUsedFocusTrap(data.usedFocusTrap !== false);
  }

  setId(id: number) {
    this.modalId = id;
  }

  setData(data: D | undefined) {
    this.modalData = data;
  }

  setPanelStyle(styles: CSSProperties | undefined) {
    this.modalPanelStyle = styles;
  }

  setComponent(component: C) {
    this.modalComponent = component;
  }

  setEntryComponent(entryComponent: EntryComponentType) {
    this.modalEntryComponent = entryComponent;
  }

  setOpenStrategy(openStrategy: OpenStrategy) {
    this.modalOpenStrategy = openStrategy;
  }

  setDuration(duration: number) {
    this.modalTransitionDuration = duration;
  }

  setFloatingModel(is: boolean) {
    this.modalFloatingOpenMode = Boolean(is);
  }

  setOverlayClose(is: boolean) {
    this.modalOverlayClose = Boolean(is);
  }

  setDisableShadow(is: boolean) {
    this.modalDisableShadow = Boolean(is);
  }

  setDisableInitAutofocus(is: boolean) {
    this.modalDisableInitAutofocus = Boolean(is);
  }

  setFullHeight(is: boolean) {
    this.modalFullHeight = is;
  }

  setPanelElement(element: HTMLElement) {
    this.modalPanelElement = element;
  }

  setOpenedActiveElement(element: OpenendActiveElement) {
    this.modalOpenedActiveElement = element;
  }

  setUsedFocusTrap(is: boolean) {
    this.modalUsedFocusTrap = is;
  }

  attachBeforeLeave(option: {
    enabledHistoryStrategy: boolean;
    beforeLeaveMessage: string;
    onPrevent: () => boolean;
  }) {
    this.attachedBeforeLeave = true;
    this.enabledHistoryStrategy = option.enabledHistoryStrategy;
    this.beforeLeaveMessage = option.beforeLeaveMessage;
    this.checkBeforeLeavePrevent = option.onPrevent;
  }

  detachBeforeLeave() {
    this.attachedBeforeLeave = false;
  }

  /**
   * 모달 닫기.
   */
  close(result?: R | undefined) {
    this.isModalClose = true;
    this.modalResult = result;
    if (this.enabledHistoryStrategy && this.attachedBeforeLeave) {
      history.back();
    } else {
      if (!this.enabledHistoryStrategy && this.attachedBeforeLeave) {
        if (this.checkBeforeLeavePrevent()) {
          // eslint-disable-next-line no-alert -- resolve
          if (!confirm(this.beforeLeaveMessage)) {
            return;
          }
        }
      }
      this.openerSubject.next({
        type: ModalEventType.CLOSE,
        modalRef: this,
      });
    }
  }

  /**
   * 모달이 (애니메이션 등 처리 후) 완전히 닫힘.
   */
  closed() {
    this.isModalClose = true;
    this.openerSubject.next({
      type: ModalEventType.CLOSED,
      modalRef: this,
    });
    this.closedSubject.next(this.modalResult);
  }

  /**
   * 모달 열림 상태 옵저버
   */
  observeOpener() {
    return this.openerSubject.asObservable();
  }

  /**
   * 모달 완전하게 닫힘 옵저버.
   * 보통은 모달에서 전달하는 값을 받아야 하는 경우 사용
   */
  observeClosed() {
    return this.closedSubject.asObservable();
  }

  /**
   * 파기
   */
  destroy() {
    try {
      this.closed();
    } catch (err) {
      console.log(err);
    }
  }
}
