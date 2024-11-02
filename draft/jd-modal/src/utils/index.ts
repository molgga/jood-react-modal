/**
 * 잠시 대기
 */
export const delay = (duration: number) => {
  if (!duration || isNaN(duration)) return Promise.resolve(true);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, duration);
  });
};
