<!-- This component contains the list of subjects -->

<script lang="ts">
    import type { SubjectStore } from "$stores/subjects";
    import { slide } from "svelte/transition";

    export let subjects: SubjectStore;
</script>

<ul>
    <!--  TODO: add weighted/unweighted switch -->
    {#each $subjects as subject (subject.id)}
        <li transition:slide|global>
            <label>
                <span>{subject.name}</span>
                {#if subject.weighted}
                    <caption>(weighted)</caption>
                {/if}
                <input type="number" min={"0"} bind:value={subject.grade} />
                <button on:click={() => subjects.remove(subject)}>Remove</button>
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

    input {
        max-width: 6em;
    }

    span {
        flex: 1;
    }

    ul {
        align-items: center;
        list-style-type: none;
        margin: 0 0 1em 0;
    }

    caption {
        color: lightgray;
    }

    li {
        position: relative;
        display: flex;
        align-items: center;
        padding: 0.5em 0.5em 0.5em 1em;
        margin: 0 0 0.5em 0;
        border-radius: 5px;
        background: green;
        filter: drop-shadow(2px 3px 6px rgba(0, 0, 0, 0.1));
    }
</style>
