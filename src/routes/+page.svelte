<script lang="ts">
    import {
        isWeighted,
        subjects,
        subjectList,
        weightedGPA,
        unweightedGPA,
    } from "$stores/subjects";
    import SubjectList from "$components/SubjectList.svelte";
    import Modal from "$components/Modal.svelte";
    import GradeReport from "$components/GradeReport.svelte";
    import type { Subject } from "$stores/subjects";
    import type District from "$lib/District";

    import { enhance } from "$app/forms";
    import { v4 as uuid } from "uuid";
    import Grade from "$components/Grade.svelte";

    export let data;
    export let form;

    // if the user imported from infinite campus, use those grades instead
    $: if (form?.success) {
        let terms: Subject[][] = [];
        form.data.forEach((term, i) => {
            let courses = term.courses.map((course) => ({
                name: course.name,
                grade: course.grade?.percent || 0,
                id: uuid(),
                weighted: isWeighted(course.name),
                term: i + 1,
            }));

            terms.push(courses);
        });

        subjects.update(() => terms.flat());
    }

    function handleKeydown(event: KeyboardEvent) {
        // only add a new subject if the user presses the "Enter" key
        if (event.key !== "Enter") return;
        let textBox = event.currentTarget as HTMLInputElement;
        // if the user didn't enter anything, don't add a new subject
        if (!textBox.value) return;

        subjects.add(textBox.value, 90); // default grade is 90
        // clear the textbox
        textBox.value = "";
    }

    function getDistrict(name: string): District | undefined {
        // we look trhought the districts and return the first with the same name
        return data.districts.find((d: District) => d.district_name == name);
    }

    enum ImportStatus {
        None,
        Loading,
        Error,
        Done,
    }

    let importDialog: HTMLDialogElement;
    let reportDialog: HTMLDialogElement;
    let importStatus = ImportStatus.None;
    let county = "Fulton County";
</script>

<GradeReport bind:dialog={reportDialog} />

<div class="board">
    <!--- <label>
        Target GPA:
        <input type="number" min="0" max="102" />
    </label> ---!>
    <!-- round GPAs to two decimal places -->
    <h2>
        GPA:
        <Grade grade={$weightedGPA} />
    </h2>

    <h2>
        Unweighted GPA:
        <Grade grade={$unweightedGPA} />
    </h2>

    <input
        list="subjects"
        name="subject"
        placeholder="enter a subject..."
        type="text"
        on:keydown={handleKeydown}
    />

    <datalist id="subjects">
        {#each subjectList as subject}
            <option value={subject}></option>
        {/each}
    </datalist>

    <SubjectList />

    <button on:click={() => importDialog.showModal()}>Import Grades From Infinite Campus</button>
    <button on:click={() => reportDialog.showModal()}>Show Report</button>
    <button on:click={() => subjects.clear()}>Clear</button>
</div>

<Modal bind:dialog={importDialog}>
    <h2 slot="title">Import Grades From Infinite Campus</h2>

    <form
        method="post"
        action="?/import"
        use:enhance={() => {
            importStatus = ImportStatus.Loading;

            return async ({ result, update }) => {
                if (result.type == "failure" || result.type == "error") {
                    importStatus = ImportStatus.Error;
                } else {
                    importStatus = ImportStatus.Done;
                    importDialog.close();
                }

                await update();
            };
        }}
    >
        <label>
            Select a County:
            <select name="district" bind:value={county} required>
                {#each data.districts as district (district.id)}
                    <option>{district.district_name}</option>
                {/each}
            </select>
        </label>

        {#if getDistrict(county)}
            <a href={getDistrict(county)?.student_login_url}>link</a>
        {/if}

        <br />

        <label>
            Username:
            <input name="username" type="text" autocomplete="username" required />
        </label>
        <br />

        <label>
            Password:
            <input name="password" type="password" autocomplete="current-password" required />
        </label>
        <br />

        <input type="submit" value="Import" />
    </form>

    {#if importStatus == ImportStatus.Loading}
        <span>importing...</span>
    {:else if importStatus == ImportStatus.Error}
        <span style="color: red;">
            There was a problem logging in. Please make sure your district, username and password
            are correct
        </span>
    {/if}
</Modal>

<style>
    .board {
        display: grid;
        max-width: 36em;
        align-items: center;
        margin: 0 auto;
    }

    .board > input {
        font-size: 1.4em;
        padding: 0.5em;
        margin: 0 0 1rem 0rem;
        width: 100%;
    }

    span {
        color: green;
    }

    .board > button {
        padding: 0.5em;
        margin: 0 0 0.5rem 0;
        margin-left: 3rem;
    }

    form {
        display: block;
    }
</style>
