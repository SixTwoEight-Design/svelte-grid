export type Column = [breakpoint: number, column: number]

export type ColumnItem = {
  fixed: boolean;
  resizable: boolean;
  draggable: boolean;
  customDragger: boolean;
  customResizer: boolean;
  min: {
    w: number;
    h: number;
  };
  max: {
    w: number;
    h: number;
  };

  x: number;
  y: number;
  w: number;
  h: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Item<T = any> = {
  id: string | number;
  [col: number]: ColumnItem;
  data: T;
}

export type Matrix = number[][]
