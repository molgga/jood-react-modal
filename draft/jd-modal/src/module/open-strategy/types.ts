import type { CSSProperties } from 'react';

export interface OpenStrategyStyleSet {
  modal?: CSSProperties;
  pivot?: CSSProperties;
  overlay?: CSSProperties;
  panel?: CSSProperties;
}

export interface OpenStrategy {
  shadow: () => OpenStrategyStyleSet;
  base: (duration?: number) => OpenStrategyStyleSet;
  opening: () => OpenStrategyStyleSet;
  opened: () => OpenStrategyStyleSet;
  closing: () => OpenStrategyStyleSet;
  floatingOpening: () => OpenStrategyStyleSet[];
}
