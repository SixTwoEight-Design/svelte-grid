import { writable } from "svelte/store"
import { browser } from "$app/environment"
import type { Item } from "$lib/index.js";

const storageKey = 'examples_saving_state';

export type ItemData = {
  colour: string;
  text: string;
}

function parseFromLocalStorage() {
  try {
    if (!browser || !localStorage) return null;
    const value = localStorage.getItem(storageKey)
    if (typeof value !== 'string') return null;
    return JSON.parse(value) as Item<ItemData>[]
  } catch (e: unknown) {
    console.error(e)
    return null;
  }
}

function saveToLocalStorage(items: Item<ItemData>[]) {
  try {
    if (!browser || !localStorage) return;
    localStorage.setItem(storageKey, JSON.stringify(items))
  } catch (e: unknown) {
    console.error(e)
  }
}

export const store = writable({
  items: parseFromLocalStorage()
})

export function saveItems(items: Item<ItemData>[]) {
  saveToLocalStorage(items);
  store.set({items});
}

export function reloadItems() {
  const items = parseFromLocalStorage();
  store.set({items});
}
