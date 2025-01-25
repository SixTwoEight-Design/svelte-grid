<script lang="ts">
  import { Grid, gridHelp, type Item } from '$lib/index.js'

  type ItemData = {
    colour: string;
    text: string;
  }

  let items: Item<ItemData>[] = [
    {
      6: gridHelp.item({
        h: 4,
        w: 2,
        x: 0,
        y: 0,
        min: {w: 1,h: 1},
        max: {w: 2,h: 3},
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
        max: {w: 2,h: 3},
      }),
      id: 'b',
      data: {
        colour: '#ddffbb',
        text: "Test B",
      }
    },
    {
      6: gridHelp.item({
        h: 4,
        w: 2,
        x: 0,
        y: 4,
        min: {w: 1,h: 1},
        max: {w: 2,h: 3},
      }),
      id: 'c',
      data: {
        colour: '#bbddff',
        text: "Test C",
      }
    },
  ]
</script>

<Grid
    cols={[[1200, 6]]}
    bind:items={items}
    rowHeight={64}
    gap={[8,8]}
>
    {#snippet renderItem({item})}
        <div style={`width: 100%; height: 100%; box-shadow: 0 0 4px black; background: ${item.data.colour}`}>
            {item.data.text}
        </div>
    {/snippet}
</Grid>
