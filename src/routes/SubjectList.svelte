<script lang="ts">
    import type { SubjectStore } from "./subjects";
    import {fly} from "svelte/transition"
    
    export let subjects: SubjectStore;
</script>

<ul>
    {#each $subjects as subject}
        <li transition:fly={{ y: 200, duration: 500 }}>
            <label>
                <span>{subject.name}</span>
                <input type="number" min={"0"} bind:value={subject.grade} />
            </label>
        </li>
    {/each}
</ul>

<style>
    label {
        width: 100%;
        height: 100%;
        display: flex;
    }

    span {
        flex: 1;
    }

    ul li {
        position: relative;
        display: flex;
        align-items: center;
        padding: 0.5em 0.5em 0.5em 1em;
        margin: 0 0 0.5em 0;
        gap: 0.5em;
        border-radius: 5px;
        user-select: none;
        background: green;
        filter: drop-shadow(2px 3px 6px rgba(0, 0, 0, 0.1));
    }
</style>
