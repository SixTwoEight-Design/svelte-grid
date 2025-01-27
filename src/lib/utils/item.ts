import { makeMatrix, makeMatrixFromItemsIgnore, findCloseBlocks, findItemsById, makeMatrixFromItems } from "./matrix.js";
import { getRowsCount } from "./other.js";
import type { ColumnBreakpoint, ColumnItem, ColumnItemWithId, Id, Item, Matrix } from "./types.js";

export function getItemById(id: Item['id'], items: Item[]) {
  return items.find((value) => value.id === id);
}

export function findFreeSpaceForItem(matrix: Matrix<ColumnItemWithId>, item: ColumnItem) {
  const cols = matrix[0].length;
  const w = Math.min(cols, item.w);
  const xNtime = cols - w;
  const getMatrixRows = matrix.length;

  for (let i = 0; i < getMatrixRows; i++) {
    const row = matrix[i];
    for (let j = 0; j < xNtime + 1; j++) {
      const sliceA = row.slice(j, j + w);
      const empty = sliceA.every((val) => val === undefined);
      if (empty) {
        const isEmpty = matrix.slice(i, i + item.h).every((a) => a.slice(j, j + w).every((n) => n === undefined));

        if (isEmpty) {
          return { y: i, x: j };
        }
      }
    }
  }

  return {
    y: getMatrixRows,
    x: 0,
  };
}

const getItem = (item: Item, col: number) => {
  return { ...item[col], id: item.id };
};

const updateItem = (elements: Item[], active: Item, update: Partial<ColumnItem>, col: number) => {
  return elements.map((value) => {
    if (value.id === active.id) {
      return { ...value, [col]: { ...value[col], ...update } };
    }
    return value;
  });
};

export function moveItemsAroundItem(active: Item, items: Item[], cols: number, /* original?: Item */) {
  // Get current item from the breakpoint
  const activeItem = getItem(active, cols);
  const ids = items.map((value) => value.id).filter((value) => value !== activeItem.id);

  const els = items.filter((value) => value.id !== activeItem.id);

  // Update items
  const newItems = updateItem(items, active, activeItem, cols);

  let matrix = makeMatrixFromItemsIgnore(newItems, ids, getRowsCount(newItems, cols), cols);
  let tempItems = newItems;

  // Exclude resolved elements ids in array
  const exclude: Id[] = [];

  els.forEach((item) => {
    // Find position for element
    const position = findFreeSpaceForItem(matrix, item[cols]);
    // Exclude item
    exclude.push(item.id);

    tempItems = updateItem(tempItems, item, position, cols);

    // Recreate ids of elements
    const getIgnoreItems = ids.filter((value) => exclude.indexOf(value) === -1);

    // Update matrix for next iteration
    matrix = makeMatrixFromItemsIgnore(tempItems, getIgnoreItems, getRowsCount(tempItems, cols), cols);
  });

  // Return result
  return tempItems;
}

export function moveItem(active: Item, items: Item[], cols: number, /* original?: Item */) {
  // Get current item from the breakpoint
  const item = getItem(active, cols);

  // Create matrix from the items expect the active
  let matrix = makeMatrixFromItemsIgnore(items, [item.id], getRowsCount(items, cols), cols);
  // Getting the ids of items under active Array<String>
  const closeBlocks = findCloseBlocks(matrix, item);
  // Getting the objects of items under active Array<Object>
  const closeObj = findItemsById(closeBlocks, items);
  // Getting whenever of these items is fixed
  const fixed = closeObj.find((value) => value[cols].fixed);

  // If found fixed, reset the active to its original position
  if (fixed) return items;

  // Update items
  items = updateItem(items, active, item, cols);

  // Create matrix of items expect close elements
  matrix = makeMatrixFromItemsIgnore(items, closeBlocks, getRowsCount(items, cols), cols);

  // Create temp vars
  let tempItems = items;
  const tempCloseBlocks = closeBlocks;

  // Exclude resolved elements ids in array
  const exclude: Id[] = [];

  // Iterate over close elements under active item
  closeObj.forEach((item) => {
    // Find position for element
    const position = findFreeSpaceForItem(matrix, item[cols]);
    // Exclude item
    exclude.push(item.id);

    // Assign the position to the element in the column
    tempItems = updateItem(tempItems, item, position, cols);

    // Recreate ids of elements
    const getIgnoreItems = tempCloseBlocks.filter((value) => exclude.indexOf(value) === -1);

    // Update matrix for next iteration
    matrix = makeMatrixFromItemsIgnore(tempItems, getIgnoreItems, getRowsCount(tempItems, cols), cols);
  });

  // Return result
  return tempItems;
}

// Helper function
export function normalize(items: Item[], col: number) {
  let result = items.slice();

  result.forEach((item) => {
    const getItem = item[col];
    if (!getItem.fixed) {
      result = moveItem(item, result, col, /* { ...item } */);
    }
  });

  return result;
}

// Helper function
export function adjust(items: Item[], col: number) {
  let matrix = makeMatrix<ColumnItemWithId>(getRowsCount(items, col), col);

  const order = items.toSorted((a, b) => {
    const aItem = a[col];
    const bItem = b[col];

    return aItem.x - bItem.x || aItem.y - bItem.y;
  });

  return order.reduce((acc, item) => {
    const position = findFreeSpaceForItem(matrix, item[col]);

    acc.push({
      ...item,
      [col]: {
        ...item[col],
        ...position,
      },
    });

    matrix = makeMatrixFromItems(acc, getRowsCount(acc, col), col);

    return acc;
  }, [] as Item[]);
}

export function getUndefinedItems(items: Item[], col: number) {
  return items
    .map((value) => {
      if (!value[col]) {
        return value.id;
      }
    })
    .filter(Boolean);
}

export function getClosestColumn(item: Item, col: number, breakpoints: ColumnBreakpoint[]) {
  return breakpoints
    .map(([, column]) => item[column] && column)
    .filter(Boolean)
    .reduce(function (acc, value) {
      const isLower = Math.abs(value - col) < Math.abs(acc - col);

      return isLower ? value : acc;
    });
}

export function specifyUndefinedColumns(items: Item[], col: number, breakpoints: ColumnBreakpoint[]) {
  let matrix = makeMatrixFromItems(items, getRowsCount(items, col), col);

  const getUndefinedElements = getUndefinedItems(items, col);

  let newItems = [...items];

  getUndefinedElements.forEach((elementId) => {
    const getElement = items.find((item) => item.id === elementId);
    if (!getElement) {
      return;
    }

    const closestColumn = getClosestColumn(getElement, col, breakpoints);

    const position = findFreeSpaceForItem(matrix, getElement[closestColumn]);

    const newItem = {
      ...getElement,
      [col]: {
        ...getElement[closestColumn],
        ...position,
      },
    };

    newItems = newItems.map((value) => (value.id === elementId ? newItem : value));

    matrix = makeMatrixFromItems(newItems, getRowsCount(newItems, col), col);
  });
  return newItems;
}
