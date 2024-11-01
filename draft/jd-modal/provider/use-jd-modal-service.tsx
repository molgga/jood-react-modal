import { createContext, useContext } from 'react';
import type { JdModalService } from '../core/jd-modal-service';

type Service = JdModalService;

export const JdModalServiceContext = createContext<Service>({} as Service);
export const useJdModalService = () => {
  return useContext<Service>(JdModalServiceContext);
};
