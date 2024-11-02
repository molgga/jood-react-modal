/**
 * 스크롤 이벤트 막기
 */
export const useJdModalScrollPrevent = () => {
  const onPreventTouchMove = (evt: TouchEvent) => {
    evt.preventDefault();
  };
  return {
    onPreventTouchMove,
  };
};
