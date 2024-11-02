import { type ReactNode, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { useJdModalEntry } from '../hooks/use-jd-modal-entry';
import { JdModalRefContext } from '../provider/use-jd-modal-ref';
import type { JdModalRef } from '../core/jd-modal-ref';
import styles from './jd-modal-entry.module.css';

interface JdModalEntryProps {
  index: number;
  modalRef: JdModalRef;
}

export function JdModalEntry({ index, modalRef }: JdModalEntryProps) {
  const refOverlay = useRef<HTMLDivElement>(null);
  const {
    setModalIndex,
    onOverlayClick,
    onOverlayTouchMove,
    refModalContainer,
    refModalPanel,
    classes,
    styles: entryStyles,
  } = useJdModalEntry({ modalRef, index });

  useEffect(() => {
    // https://legacy.reactjs.org/blog/2020/08/10/react-v17-rc.html#potential-issues
    const domOverlay = refOverlay.current;
    domOverlay?.addEventListener('touchmove', onOverlayTouchMove, {
      passive: false,
    });
    setModalIndex(index);
    return () => {
      domOverlay?.removeEventListener('touchmove', onOverlayTouchMove);
    };
  }, [index, setModalIndex, onOverlayTouchMove]);

  return (
    <JdModalRefContext.Provider value={modalRef}>
      <div
        ref={refModalContainer}
        className={clsx(styles.entry, classes)}
        style={entryStyles.modal}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
      >
        <div
          ref={refOverlay}
          className={styles.overlay}
          style={entryStyles.overlay}
          role="presentation"
          onClick={onOverlayClick}
        >
          &nbsp;
        </div>
        <div
          ref={refModalPanel}
          className={styles.panel}
          style={entryStyles.panel}
        >
          <div className={styles.pivot} style={entryStyles.pivot}>
            <div className={styles.content}>
              {modalRef.component as ReactNode}
            </div>
          </div>
        </div>
      </div>
    </JdModalRefContext.Provider>
  );
}
