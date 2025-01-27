import type { ColumnItemWithId, Id, Item, Matrix } from "./types.js";

export function makeMatrix<T>(rows: number, cols: number): Matrix<T> {
  return Array.from(Array(rows), () => new Array(cols)); // make 2d array
}

export function makeMatrixFromItems(items: Item[], _row: number, _col: number) {
  const matrix = makeMatrix(_row, _col) as Matrix<ColumnItemWithId>;

  for (const item of items) {
    const colItem = item[_col];
    if (colItem) {
      const id = item.id;
      const width = Math.min(_col, colItem.w);

      // For the Y coords that this item spans:
      for (let y = colItem.y; y < colItem.y + colItem.h; y++) {
        const row = matrix[y];
        for (let k = colItem.x; k < colItem.x + width; k++) {
          row[k] = { ...colItem, id };
        }
      }
    }
  }

  return matrix;
}

export function findCloseBlocks(matrix: Matrix<ColumnItemWithId>, colItem: ColumnItemWithId) {

  const w = Math.min(matrix[0].length, colItem.w);
  const tempR = matrix.slice(colItem.y, colItem.y + colItem.h);

  let result: Id[] = [];
  for (let i = 0; i < tempR.length; i++) {
    const tempA = tempR[i].slice(colItem.x, colItem.x + w);
    result = [
      ...result,
      ...tempA
        .map((val) => val.id && val.id !== colItem.id && val.id)
        .filter(Boolean) as Id[],
    ];
  }

  return [...new Set(result)];
}

export function makeMatrixFromItemsIgnore(items: Item[], ignoreList: Id[], _row: number, _col: number) {
  const matrix = makeMatrix<ColumnItemWithId>(_row, _col);
  for (const item of items) {
    const colItem = item[_col];
    const id = item.id;
    const width = Math.min(_col, colItem.w);

    if (ignoreList.indexOf(id) === -1) {
      for (let y = colItem.y; y < colItem.y + colItem.h; y++) {
        const row = matrix[y];
        if (row) {
          for (let x = colItem.x; x < colItem.x + width; x++) {
            row[x] = { ...colItem, id };
          }
        }
      }
    }
  }
  return matrix;
}

export function findItemsById(closeBlocks: Id[], items: Item[]) {
  return items.filter((value) => closeBlocks.indexOf(value.id) !== -1);
}
