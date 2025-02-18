<script lang="ts">
  import { Grid, gridHelp, type Item } from '$lib/index.js'

  type ItemData = {
    colour: string;
    text: string;
    bigText: string;
  }

  let items: Item<ItemData>[] = $state([
    {
      6: gridHelp.item({
        h: 4,
        w: 2,
        x: 0,
        y: 0,
        min: {w: 1,h: 1},
        max: {w: 2,h: 4},
      }),
      id: 'a',
      data: {
        colour: '#ffddbb',
        text: "Test A",
        bigText: "Test A Long Text"
      }
    },
    {
      6: gridHelp.item({
        h: 4,
        w: 2,
        x: 2,
        y: 0,
        min: {w: 1,h: 1},
        max: {w: 2,h: 4},
      }),
      id: 'b',
      data: {
        colour: '#ddffbb',
        text: "Test B",
        bigText: "Test B Long Text"
      }
    },
    {
      6: gridHelp.item({
        h: 4,
        w: 2,
        x: 3,
        y: 5,
        min: {w: 1,h: 1},
        max: {w: 2,h: 4},
        fixed: true,
      }),
      id: 'c',
      data: {
        colour: '#bbddff',
        text: "Test C",
        bigText: "Test C Long Text"
      }
    },
  ])
</script>

<h1>Basic stateful example</h1>

<Grid
    cols={[[800,3], [1200, 6]]}
    bind:items={items}
    rowHeight={64}
    gap={[8,8]}
    showGrid={true}
>
    {#snippet renderItem({item, columnItem, index, columns})}
        <div class={"relative w-full h-full shadow-md rounded-md p-4 " + (columnItem.fixed ? 'outline outline-red-500' : '')} style={`background: ${item.data.colour}`}>
            {#if columnItem.w > 1 }
                {item.data.bigText}
            {:else}
                {item.data.text}
            {/if}

            <button class="absolute top-0 right-0 bg-blue-300 p-2 rounded-tr-md" type="button" onclick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              items[index][columns].fixed = !items[index][columns].fixed
              items[index][columns].resizable = !items[index][columns].fixed
              items[index][columns].draggable = !items[index][columns].fixed
            }}>
                {#if columnItem.fixed}
                    Unpin
                {:else}
                    Pin
                {/if}
            </button>
        </div>
    {/snippet}
</Grid>

<style>
    :global(.svlt-grid-shadow) {
        /* Back shadow */
        background: gray !important;
    }
    :global(.svlt-grid-container) {
        /* Container color */
        background: #eee;
    }
    :global(.svlt-grid-resizer::after) {
        /* Resizer color */
        border-color: red !important;
    }
</style>
