import { JdModalServiceContext } from './context';
import { JdModalService } from '../core/jd-modal-service';
import { JdModalAppender } from '../ui/jd-modal-appender';

interface Props {
  value: JdModalService;
  children: React.ReactNode;
}

export const JdModalProvider = ({ value, children }: Props) => {
  return (
    <JdModalServiceContext.Provider value={value}>
      {children}
      <JdModalAppender />
    </JdModalServiceContext.Provider>
  );
};
