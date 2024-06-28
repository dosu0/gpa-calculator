<!-- This component contains the list of subjects -->

<script lang="ts">
    import { slide } from "svelte/transition";
    import { subjects } from "$stores/subjects";
    import { currentSemester } from "$stores/subjects";

    // Given a subject, we make sure that its grade is between 0 and 102
    function validate(i: number) {
        if ($subjects[$currentSemester - 1][i].grade > 102)
            $subjects[$currentSemester - 1][i].grade = 102;
        if ($subjects[$currentSemester - 1][i].grade < 0)
            $subjects[$currentSemester - 1][i].grade = 0;
    }
</script>

<ul>
    <!--This is a svelte for loop, 
        we use this to generate HTML for every subject 
    -->
    {#if $currentSemester != 3}
        {#each $subjects[$currentSemester - 1] as subject, i (subject.id)}
            <li transition:slide|global>
                <label>
                    <span>{subject.name}</span>
                    {#if subject.weighted}
                        <caption>(weighted)</caption>
                    {/if}

                    <input
                        type="number"
                        min={0}
                        max={102}
                        bind:value={subject.grade}
                        on:input={() => validate(i)}
                    />
                    <button on:click={() => subjects.remove(subject.id)}>Remove</button>
                </label>
            </li>
        {/each}
    {:else}
        {#each $subjects[0] as subject, i (subject.id)}
            <li transition:slide|global>
                <label>
                    <span>{subject.name}</span>
                    {#if subject.weighted}
                        <caption>(weighted)</caption>
                    {/if}

                    <input
                        type="number"
                        min={0}
                        max={102}
                        bind:value={subject.grade}
                        on:input={() => validate(i)}
                    />
                    <button on:click={() => subjects.remove(subject.id)}>Remove</button>
                </label>
            </li>
        {/each}

        <hr />

        {#each $subjects[1] as subject, i (subject.id)}
            <li transition:slide|global>
                <label>
                    <span>{subject.name}</span>
                    {#if subject.weighted}
                        <caption>(weighted)</caption>
                    {/if}

                    <input
                        type="number"
                        min={0}
                        max={102}
                        bind:value={subject.grade}
                        on:input={() => validate(i)}
                    />
                    <button on:click={() => subjects.remove(subject.id)}>Remove</button>
                </label>
            </li>
        {/each}
    {/if}
</ul>

<style>
    label {
        width: 100%;
        height: 100%;
        display: flex;
        color: white;
    }

    input {
        width: 5em;
    }

    span {
        flex: 1;
    }

    ul {
        align-items: center;
        list-style-type: none;
        margin: 0 0 1em 0;
    }

    hr {
        margin-top: 1em;
        margin-bottom: 1em;
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
