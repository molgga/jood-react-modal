export function touch(currentServiceId: number, current: number) {
  const { current: before } = getStateOfHistory(currentServiceId);
  const state = {
    jdModal: {
      serviceId: currentServiceId,
      before,
      current,
    },
  };
  window.history.pushState(state, '');
}

export function getStateOfHistory(currentServiceId: number) {
  return getStateOf(
    currentServiceId,
    (window.history.state || {}) as HashState
  );
}

export function getStateOfEvent(currentServiceId: number, evt: PopStateEvent) {
  return getStateOf(currentServiceId, (evt.state || {}) as HashState);
}

interface HashState {
  jdModal: {
    serviceId?: number;
    before?: number;
    current?: number;
  };
}

export function getStateOf(currentServiceId: number, state: HashState) {
  const { jdModal } = state;
  const { serviceId = null, before = null, current = null } = jdModal || {};
  if (currentServiceId === serviceId) {
    return { serviceId, before, current };
  }
  return { serviceId: null, before: null, current: null };
}
