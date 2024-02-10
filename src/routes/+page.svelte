<script lang="ts">
    import {
        isWeighted,
        subjects,
        subjectList,
        weightedGPA,
        unweightedGPA,
        lowestGrade,
        highestGrade,
    } from "$stores/subjects";
    import SubjectList from "$components/SubjectList.svelte";
    import Modal from "$components/Modal.svelte";
    import type District from "$lib/District";
    import { enhance } from "$app/forms";
    import { v4 as uuid } from "uuid";

    export let data;
    export let form;

    // if the user imported from infinite campus, use those grades instead
    $: if (form?.success) {
        let terms = [];
        form.data.forEach((term, i) => {
            let courses = term.courses.map((course) => ({
                name: `${course.name} (${i + 1})`,
                grade: course.grades?.percent || 0,
                id: uuid(),
                weighted: isWeighted(course.name),
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

    function gradeColor(grade: number): string {
        if (grade >= 90) {
            return "green";
        } else if (grade >= 80) {
            return "yellowgreen";
        } else if (grade >= 70) {
            return "orange";
        } else {
            return "red";
        }
    }
</script>

<div class="board">
    <!--- <label>
        Target GPA:
        <input type="number" min="0" max="102" />
    </label> ---!>
    <!-- round GPAs to two decimal places -->
    <h2>
        GPA:
        <span style="color: {gradeColor($weightedGPA)}">
            {$weightedGPA.toFixed(2)}
        </span>
    </h2>

    <h2>
        Unweighted GPA:
        <span style="color: {gradeColor($unweightedGPA)}">
            {$unweightedGPA.toFixed(2)}
        </span>
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

    <button on:click={() => importDialog.showModal()}>Import grades from Infinite Campus</button>
    <button on:click={() => reportDialog.showModal()}>Show Report</button>
    <button on:click={() => subjects.clear()}>Clear</button>
</div>

<Modal bind:dialog={reportDialog}>
    <h2 slot="title">Grade Report</h2>

    <p>
        <b>GPA:</b>
        <span style="color: {gradeColor($weightedGPA)}">
            {$weightedGPA.toFixed(2)}
        </span>
    </p>
    <p>
        <b>Unweighted GPA:</b>
        <span style="color: {gradeColor($unweightedGPA)}">
            {$unweightedGPA.toFixed(2)}
        </span>
    </p>

    <p>
        <b>Lowest Grade:</b>
        <span style="color: {gradeColor($lowestGrade.grade)}">
            {$lowestGrade.grade.toFixed(2)}
            ({$lowestGrade.name})
        </span>
    </p>

    <p>
        <b>Highest Grade:</b>
        <span style="color: {gradeColor($highestGrade.grade)}">
            {$highestGrade.grade.toFixed(2)}
            ({$highestGrade.name})
        </span>
    </p>
</Modal>

<Modal bind:dialog={importDialog}>
    <h2 slot="title">Import grades from Infinite Campus</h2>

    <form
        method="post"
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
            select a county:
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
