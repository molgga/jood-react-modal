import { useEffect, useRef } from 'react';
import clsx from 'clsx';
import { useJdModalEntry } from '../hooks';
import { JdModalRefContext } from '../provider';
import { JdModalRef } from '../core';
import styles from './jd-modal-entry.module.css';

interface Props {
  index: number;
  modalRef: JdModalRef;
}

export const JdModalEntry = ({ index, modalRef }: Props) => {
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
        tabIndex={0}
      >
        <div
          ref={refOverlay}
          className={styles.overlay}
          style={entryStyles.overlay}
          onClick={onOverlayClick}
        ></div>
        <div
          ref={refModalPanel}
          className={styles.panel}
          style={entryStyles.panel}
        >
          <div className={styles.pivot} style={entryStyles.pivot}>
            <div className={styles.content}>{modalRef.component}</div>
          </div>
        </div>
      </div>
    </JdModalRefContext.Provider>
  );
};
