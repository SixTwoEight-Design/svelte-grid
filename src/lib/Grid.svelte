<style>
  .svlt-grid-container {
    position: relative;
    width: 100%;
  }
</style>

<div class="svlt-grid-container" style="height: {containerHeight}px" bind:this={container}>
  {#if xPerPx || !fastStart}
    {#each items as item, i (item.id)}
      <MoveResize
        onrepaint={handleRepaint}
        onpointerup={pointerup}
        id={item.id}
        resizable={item[getComputedCols] && item[getComputedCols].resizable}
        draggable={item[getComputedCols] && item[getComputedCols].draggable}
        {xPerPx}
        {yPerPx}
        width={Math.min(getComputedCols, item[getComputedCols] && item[getComputedCols].w) * xPerPx - gapX * 2}
        height={(item[getComputedCols] && item[getComputedCols].h) * yPerPx - gapY * 2}
        top={(item[getComputedCols] && item[getComputedCols].y) * yPerPx + gapY}
        left={(item[getComputedCols] && item[getComputedCols].x) * xPerPx + gapX}
        item={item[getComputedCols]}
        min={item[getComputedCols] && item[getComputedCols].min}
        max={item[getComputedCols] && item[getComputedCols].max}
        cols={getComputedCols}
        {gapX}
        {gapY}
        {sensor}
        container={scroller}
        nativeContainer={container}
      >
        {#snippet renderItemContent({movePointerDown, resizePointerDown})}
            {#if item[getComputedCols]}
                {@render renderItem({item, columnItem: item[getComputedCols], index: i, movePointerDown, resizePointerDown, })}
            {/if}
        {/snippet}
      </MoveResize>
    {/each}
  {/if}
</div>

<script module lang="ts">
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type T = any; //Just for LSP to stop complaining

  export type OnResizeCallback = (data: {
      cols: number,
      xPerPx: number,
      yPerPx: number,
      width: number,
    }) => void;
  export type OnMountCallback = (data: {
    cols: number,
    xPerPx: number,
    yPerPx: number,
  }) => void;
  export type OnPointerUpCallback = (data: {
    id: string|number,
    cols: number,
  }) => void;
  export type OnChangeCallback<T> = (data: {
      unsafeItem: Item<T>,
      id: Item['id'],
      cols: number,
  }) => void
</script>

<script lang="ts" generics="T = any">
  import { getContainerHeight } from "./utils/container.js";
  import { moveItemsAroundItem, moveItem, getItemById, specifyUndefinedColumns } from "./utils/item.js";
  import { onMount, type Snippet } from "svelte";
  import { getColumn, throttle } from "./utils/other.js";
  import MoveResize, { type RepaintData, type PointerUpData } from "./MoveResize.svelte";
  import type { Column, ColumnItem, Item } from "./utils/types.js";

  let {
    renderItem,

    items = $bindable(),
    rowHeight,
    cols,

    gap = [10, 10],
    fillSpace = false,
    fastStart = false,
    throttleUpdate = 100,
    throttleResize = 100,
    scroller,
    sensor = 20,

    onresize,
    onmount,
    onpointerup,
    onchange,
  }: {
    renderItem: Snippet<[{
      item: Item<T>,
      columnItem: ColumnItem;
      index: number,
      movePointerDown: (e: PointerEvent) => void,
      resizePointerDown: (e: PointerEvent) => void,
    }]>;

    items: Item<T>[];
    rowHeight: number;
    cols: Column[];

    gap?: [number, number];
    fillSpace?: boolean;
    fastStart?: boolean;
    throttleUpdate?: number;
    throttleResize?: number;
    scroller?: Element;
    sensor?: number;

    onresize?: OnResizeCallback,
    onmount?: OnMountCallback,
    onpointerup?: OnPointerUpCallback,
    onchange?: OnChangeCallback<T>,
  } = $props();

  let getComputedCols: number = $state(0);

  let container: Element|undefined = $state();

  let [gapX, gapY] = $derived(gap);

  let xPerPx: number = $state(0);
  let yPerPx: number = $derived(rowHeight);

  let containerWidth: number = $state(0);

  let containerHeight = $derived(getContainerHeight(items, yPerPx, getComputedCols));

  const pointerup = ({ id }: PointerUpData) => {
    onpointerup?.({
      id,
      cols: getComputedCols,
    })
  };

  const onResize = throttle(() => {
    items = specifyUndefinedColumns(items, getComputedCols, cols);
    onresize?.({
      cols: getComputedCols,
      xPerPx,
      yPerPx,
      width: containerWidth,
    })
  }, throttleUpdate);

  onMount(() => {
    const sizeObserver = new ResizeObserver((entries) => {
      requestAnimationFrame(() => {
        let width = entries[0].contentRect.width;

        if (width === containerWidth) return;

        getComputedCols = getColumn(width, cols);

        xPerPx = width / getComputedCols;

        if (!containerWidth) {
          items = specifyUndefinedColumns(items, getComputedCols, cols);

          onmount?.({
            cols: getComputedCols,
            xPerPx,
            yPerPx, // same as rowHeight
          });
        } else {
          onResize();
        }

        containerWidth = width;
      });
    });

    if (container) {
      sizeObserver.observe(container);
    }

    return () => sizeObserver.disconnect();
  });

  const updateMatrix = (data: RepaintData) => {
    let activeItem = getItemById(data.id, items);

    if (activeItem) {
      activeItem = {
        ...activeItem,
        [getComputedCols]: {
          ...activeItem[getComputedCols],
          ...data.shadow,
        },
      };

      if (fillSpace) {
        items = moveItemsAroundItem(activeItem, items, getComputedCols, getItemById(data.id, items));
      } else {
        items = moveItem(activeItem, items, getComputedCols, getItemById(data.id, items));
      }

      if (data.onUpdate) data.onUpdate();

      onchange?.({
        unsafeItem: activeItem,
        id: activeItem.id,
        cols: getComputedCols,
      })
    }
  };

  const throttleMatrix = throttle(updateMatrix, throttleResize);

  const handleRepaint = (data: RepaintData) => {
    if (!data.isPointerUp) {
      throttleMatrix(data);
    } else {
      updateMatrix(data);
    }
  };
</script>
