import type { Column, Item } from "./types.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function throttle<T extends (...args: any[]) => any>(func: T, timeFrame: number): T {
  let lastTime = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastTime >= timeFrame) {
      func(...args);
      lastTime = now;
    }
  } as T;
}

export function getRowsCount(items: Item[], cols: number) {
  const getItemsMaxHeight = items.map((val) => {
    const item = val[cols];

    return (item && item.y) + (item && item.h) || 0;
  });

  return Math.max(...getItemsMaxHeight, 1);
}

export const getColumn = (containerWidth: number, columns: Column[]): number => {
  const sortColumns = columns.slice().sort((a, b) => a[0] - b[0]);

  const breakpoint = sortColumns.find((value) => {
    const [width] = value;
    return containerWidth <= width;
  });

  if (breakpoint) {
    return breakpoint[1];
  } else {
    return sortColumns[sortColumns.length - 1][1];
  }
};
