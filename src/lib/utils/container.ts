import { getRowsCount } from "./other.js";
import type { Item } from "./types.js";

export function getContainerHeight(items: Item[], yPerPx: number, cols: number) {
  return getRowsCount(items, cols) * yPerPx;
}
