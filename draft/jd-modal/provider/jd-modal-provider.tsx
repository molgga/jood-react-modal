import type { JdModalService } from '../core/jd-modal-service';
import { JdModalAppender } from '../ui/jd-modal-appender';
import { JdModalServiceContext } from './use-jd-modal-service';

interface JdModalProviderProps {
  value: JdModalService;
  children: React.ReactNode;
}

export function JdModalProvider({ value, children }: JdModalProviderProps) {
  return (
    <JdModalServiceContext.Provider value={value}>
      {children}
      <JdModalAppender />
    </JdModalServiceContext.Provider>
  );
}
