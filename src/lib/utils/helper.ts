import { makeMatrixFromItems } from "./matrix.js";
import { findFreeSpaceForItem, normalize, adjust } from "./item.js";
import { getRowsCount } from "./other.js";
import type { Item, ColumnItem } from "./types.js";

type MakeItem = Partial<ColumnItem> & Pick<ColumnItem, 'x'|'y'|'h'|'w'>

function makeItem(item: MakeItem): ColumnItem {
  const { min = { w: 1, h: 1 }, max } = item;
  return {
    fixed: false,
    resizable: !item.fixed,
    draggable: !item.fixed,
    customDragger: false,
    customResizer: false,
    min: {
      w: Math.max(1, min.w),
      h: Math.max(1, min.h),
    },
    max: {
      w: 1,
      h: 1,
      ...max,
    },
    ...item,
  };
}

const gridHelp = {
  normalize: normalize,

  adjust: adjust,

  item: makeItem,

  findSpace(item: Item, items: Item[], cols: number) {
    const matrix = makeMatrixFromItems(items, getRowsCount(items, cols), cols);

    const position = findFreeSpaceForItem(matrix, item[cols]);
    return position;
  },
};

export default gridHelp;
