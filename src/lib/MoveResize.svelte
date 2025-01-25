<style>
  .svlt-grid-item {
    touch-action: none;
    position: absolute;
    will-change: auto;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .svlt-grid-resizer {
    user-select: none;
    width: 20px;
    height: 20px;
    position: absolute;
    right: 0;
    bottom: 0;
    cursor: se-resize;
  }
  .svlt-grid-resizer::after {
    content: "";
    position: absolute;
    right: 3px;
    bottom: 3px;
    width: 5px;
    height: 5px;
    border-right: 2px solid rgba(0, 0, 0, 0.4);
    border-bottom: 2px solid rgba(0, 0, 0, 0.4);
  }

  .svlt-grid-active {
    z-index: 3;
    cursor: grabbing;
    position: fixed;
    opacity: 0.5;

    /*No user*/
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    -moz-backface-visibility: hidden;
    -o-backface-visibility: hidden;
    -ms-backface-visibility: hidden;
    user-select: none;
  }

  .shadow-active {
    z-index: 2;
    transition: all 0.2s;
  }

  .svlt-grid-shadow {
    position: absolute;
    background: red;
    will-change: transform;
    background: pink;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }
</style>

<div
  draggable={false}
  onpointerdown={getPointerDownHandler()}
  class="svlt-grid-item"
  class:svlt-grid-active={active || (trans && rect)}
  style="width: {active ? newSize.width : width}px; height:{active ? newSize.height : height}px;
  {active ? `transform: translate(${cordDiff.x}px, ${cordDiff.y}px);top:${rect.top}px;left:${rect.left}px;` : trans ? `transform: translate(${cordDiff.x}px, ${cordDiff.y}px); position:absolute; transition: width 0.2s, height 0.2s;` : `transition: transform 0.2s, opacity 0.2s; transform: translate(${left}px, ${top}px); `} ">

  {@render renderItemContent({movePointerDown: pointerdown, resizePointerDown})}

  {#if resizable && !item.customResizer}
      <div class="svlt-grid-resizer" onpointerdown={resizePointerDown}></div>
  {/if}
</div>

{#if active || trans}
    <div class="svlt-grid-shadow shadow-active" style="width: {shadow.w * xPerPx - gapX * 2}px; height: {shadow.h * yPerPx - gapY * 2}px; transform: translate({shadow.x * xPerPx + gapX}px, {shadow.y * yPerPx + gapY}px); " bind:this={shadowElement}></div>
{/if}

<script module lang="ts">
  export type PointerUpData = {
    id: Id,
  }
  export type RepaintData = {
    id: Id,
    shadow: {
        x: number;
        y: number;
        w: number;
        h: number;
    },
    isPointerUp?: boolean,
    onUpdate?: () => void,
  };
</script>

<script lang="ts">
  import type { ColumnItem, Id } from "$lib/utils/types.js";
  import { type Snippet } from "svelte";

  let {
    renderItemContent,

    onpointerup,
    onrepaint,
    sensor,
    width,
    height,
    left,
    top,
    resizable,
    draggable,
    id,
    container,
    xPerPx,
    yPerPx,
    gapX,
    gapY,
    item,
    max,
    min,
    cols,
    nativeContainer,
  }: {
    renderItemContent: Snippet<[{
      movePointerDown: (e: PointerEvent) => void,
      resizePointerDown: (e: PointerEvent) => void
    }]>;

    onpointerup: (data: PointerUpData) => void;
    onrepaint: (data: RepaintData) => void;
    sensor: number;
    width: number;
    height: number;
    left: number;
    top: number;
    resizable: boolean;
    draggable: boolean;
    id: Id;
    container?: Element;
    xPerPx: number;
    yPerPx: number;
    gapX: number;
    gapY: number;
    item: ColumnItem;
    max: ColumnItem['max'] & {y?: number};
    min: ColumnItem['min'];
    cols: number;
    nativeContainer: Element;
  } = $props();

  let shadowElement: Element|undefined = $state();
  let shadow = $state({ x: 0, y: 0, w: 0, h: 0 });

  let active = $state(false);

  let initX: number = $state(0);
  let initY: number = $state(0);

  let capturePos = $state({
    x: 0,
    y: 0,
  });

  let cordDiff = $state({ x: 0, y: 0 });

  let newSize = $state({ width, height });
  let trans = $state(false);

  let anima: number|undefined = $state();

  const inActivate = () => {
    if (!shadowElement) {
      throw new Error('Element not bound');
    }
    const shadowBound = shadowElement.getBoundingClientRect();
    const xdragBound = rect.left + cordDiff.x;
    const ydragBound = rect.top + cordDiff.y;

    cordDiff.x = shadow.x * xPerPx + gapX - (shadowBound.x - xdragBound);
    cordDiff.y = shadow.y * yPerPx + gapY - (shadowBound.y - ydragBound);

    active = false;
    trans = true;

    clearTimeout(anima);

    anima = setTimeout(() => {
      trans = false;
    }, 100);

    onpointerup({id})
  };

  let repaint = (cb?: () => void, isPointerUp?: boolean) => {
    onrepaint({
      id,
      shadow,
      isPointerUp,
      onUpdate: cb,
    })
  };

  // Autoscroll
  let _scrollTop = $state(0);
  let containerFrame: ReturnType<typeof getContainerFrame>|undefined = $state();
  let rect = $state({ left: 0, top: 0 });
  let scrollElement: Element|undefined = $state();

  const getContainerFrame = (element?: Element) => {
    if (element === document.documentElement || !element) {
      const { top, bottom } = nativeContainer.getBoundingClientRect();

      return {
        top: Math.max(0, top),
        bottom: Math.min(window.innerHeight, bottom),
      };
    }

    return element.getBoundingClientRect();
  };

  const getScroller = (element?: Element) => (!element ? document.documentElement : element);

  const pointerdown = ({ clientX, clientY, target }: PointerEvent) => {
    initX = clientX;
    initY = clientY;

    capturePos = { x: left, y: top };
    shadow = { x: item.x, y: item.y, w: item.w, h: item.h };
    newSize = { width, height };

    containerFrame = getContainerFrame(container);
    scrollElement = getScroller(container);

    cordDiff = { x: 0, y: 0 };
    if (target){
      const closestGridItem = (target as Element).closest(".svlt-grid-item");
      if (closestGridItem) {
        rect = closestGridItem.getBoundingClientRect();
      }
    }
    active = true;
    trans = false;
    _scrollTop = scrollElement.scrollTop;

    window.addEventListener("pointermove", pointermove);
    window.addEventListener("pointerup", pointerup);
  };

  function getPointerDownHandler() {
    if (item && item.customDragger) {
      return null;
    }
    return draggable ? pointerdown : null;
  }

  let sign = { x: 0, y: 0 };
  let vel = { x: 0, y: 0 };
  let intervalId: number|undefined = $state(undefined);

  const stopAutoscroll = () => {
    clearInterval(intervalId);
    intervalId = undefined;
    sign = { x: 0, y: 0 };
    vel = { x: 0, y: 0 };
  };

  const update = () => {
    const _newScrollTop = (scrollElement?.scrollTop ?? 0) - _scrollTop;

    const boundX = capturePos.x + cordDiff.x;
    const boundY = capturePos.y + (cordDiff.y + _newScrollTop);

    let gridX = Math.round(boundX / xPerPx);
    let gridY = Math.round(boundY / yPerPx);

    shadow.x = Math.max(Math.min(gridX, cols - shadow.w), 0);
    shadow.y = Math.max(gridY, 0);

    if (max.y) {
      shadow.y = Math.min(shadow.y, max.y);
    }

    repaint();
  };

  const pointermove = (event: PointerEvent) => {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const { clientX, clientY } = event;
    cordDiff = { x: clientX - initX, y: clientY - initY };

    const Y_SENSOR = sensor;

    if (!containerFrame) {
      throw new Error('Container frame not set');
    }

    let velocityTop = Math.max(0, (containerFrame.top + Y_SENSOR - clientY) / Y_SENSOR);
    let velocityBottom = Math.max(0, (clientY - (containerFrame.bottom - Y_SENSOR)) / Y_SENSOR);

    const topSensor = velocityTop > 0 && velocityBottom === 0;
    const bottomSensor = velocityBottom > 0 && velocityTop === 0;

    sign.y = topSensor ? -1 : bottomSensor ? 1 : 0;
    vel.y = sign.y === -1 ? velocityTop : velocityBottom;

    if (vel.y > 0) {
      if (!intervalId && scrollElement) {
        // Start scrolling
        // TODO Use requestAnimationFrame
        intervalId = setInterval(() => {
          scrollElement!.scrollTop += 2 * (vel.y + Math.sign(vel.y)) * sign.y;
          update();
        }, 10);
      }
    } else if (intervalId) {
      stopAutoscroll();
    } else {
      update();
    }
  };

  const pointerup = () => {
    stopAutoscroll();

    window.removeEventListener("pointerdown", pointerdown);
    window.removeEventListener("pointermove", pointermove);
    window.removeEventListener("pointerup", pointerup);
    repaint(inActivate, true);
  };

  // Resize

  let resizeInitPos = { x: 0, y: 0 };
  let initSize = { width: 0, height: 0 };

  const resizePointerDown = (e: PointerEvent) => {
    e.stopPropagation();
    const { pageX, pageY } = e;

    resizeInitPos = { x: pageX, y: pageY };
    initSize = { width, height };

    cordDiff = { x: 0, y: 0 };
    if (e.target) {
      const closest = (e.target as Element).closest(".svlt-grid-item")
      if (closest) {
        rect = closest.getBoundingClientRect();
      }
    }
    newSize = { width, height };

    active = true;
    trans = false;
    shadow = { x: item.x, y: item.y, w: item.w, h: item.h };

    containerFrame = getContainerFrame(container);
    scrollElement = getScroller(container);

    window.addEventListener("pointermove", resizePointerMove);
    window.addEventListener("pointerup", resizePointerUp);
  };

  const resizePointerMove = ({ pageX, pageY }: PointerEvent) => {
    newSize.width = initSize.width + pageX - resizeInitPos.x;
    newSize.height = initSize.height + pageY - resizeInitPos.y;

    // Get max col number
    let maxWidth = cols - shadow.x;
    maxWidth = Math.min(max.w, maxWidth) || maxWidth;

    // Limit bound
    newSize.width = Math.max(Math.min(newSize.width, maxWidth * xPerPx - gapX * 2), min.w * xPerPx - gapX * 2);

    newSize.height = Math.max(newSize.height, min.h * yPerPx - gapY * 2);

    if (max.h) {
      newSize.height = Math.min(newSize.height, max.h * yPerPx - gapY * 2);
    }
    // Limit col & row
    shadow.w = Math.round((newSize.width + gapX * 2) / xPerPx);
    shadow.h = Math.round((newSize.height + gapY * 2) / yPerPx);

    repaint();
  };

  const resizePointerUp = (e: PointerEvent) => {
    e.stopPropagation();

    repaint(inActivate, true);

    window.removeEventListener("pointermove", resizePointerMove);
    window.removeEventListener("pointerup", resizePointerUp);
  };
</script>
