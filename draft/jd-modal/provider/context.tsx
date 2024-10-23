import { createContext, useContext } from 'react';
import { JdModalService, JdModalRef } from '../core';

type Service = JdModalService;
type Ref<R = any, D = any, C = any> = JdModalRef<R, D, C>;

export const JdModalServiceContext = createContext<Service>({} as Service);
export const JdModalRefContext = createContext<Ref>({} as Ref);

export const useJdModalService = () => {
  return useContext<Service>(JdModalServiceContext) as Service;
};

export const useJdModalRef = <R, D = any, C = any>(): Ref<R, D, C> => {
  return useContext(JdModalRefContext);
};
