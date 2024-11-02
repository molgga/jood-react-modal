import clsx from 'clsx';
import { useJdModalAppender } from '../hooks/use-jd-modal-appender';
import { JdModalEntry } from './jd-modal-entry';
import styles from './jd-modal-appender.module.css';

export function JdModalAppender() {
  const { modalRefs, classes } = useJdModalAppender();
  return (
    <div className={clsx(styles.container, classes)}>
      <div className={styles.appender}>
        {modalRefs.map((modalRef, index) => {
          return (
            <JdModalEntry key={modalRef.id} modalRef={modalRef} index={index} />
          );
        })}
      </div>
    </div>
  );
}
