export type ColumnBreakpoint = [breakpoint: number, column: number]
export type Id = string | number;

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

export type ColumnItemWithId = ColumnItem & { id: Id };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Item<T = any> = {
  id: Id;
  [col: number]: ColumnItem;
  data: T;
}

export type Matrix<T = number> = T[][]
