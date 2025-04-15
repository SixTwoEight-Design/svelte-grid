<script lang="ts">
  import { Grid, gridHelp, type Item } from '$lib/index.js'
  import { store, saveItems, reloadItems, type ItemData } from './store.svelte.js'

  const defaultItems = [
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
      }
    },
  ]

  let items: Item<ItemData>[] = $state($store.items ?? defaultItems)

  let isDirty = $derived(!$store.items || JSON.stringify($store.items) !== JSON.stringify(items))

</script>

<h1>Local storage saving example</h1>

<button class="btn" disabled={!isDirty} onclick={() => {
  reloadItems()
  items = $store.items ?? defaultItems
}}>
    Reload from local storage
</button>
<button class="btn" disabled={!isDirty} onclick={() => {
  saveItems(items)
}}>
    Save to local storage
</button>

<Grid
    cols={[[800,3], [1200, 6]]}
    bind:items={items}
    rowHeight={64}
    gap={[8,8]}
    showGrid={true}
>
    {#snippet renderItem({item, columnItem, index, columns})}
        <div class={"relative w-full h-full shadow-md rounded-md p-4 " + (columnItem.fixed ? 'outline outline-red-500' : '')} style={`background: ${item.data.colour}`}>
            {item.data.text}

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
