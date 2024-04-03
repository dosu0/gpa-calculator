import { writable } from "svelte/store";

export type Settings = {
    autosave: boolean;
};

export const settings = writable<Settings>({
    autosave: true,
});
