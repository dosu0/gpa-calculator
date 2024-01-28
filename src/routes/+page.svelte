<script lang="ts">
    import { isWeighted, subjects } from "$stores/subjects";
    import SubjectList from "$components/SubjectList.svelte";
    import Modal from "$components/Modal.svelte";
    import { derived } from "svelte/store";
    import type District from "$lib/District";
    import { enhance } from "$app/forms";

    export let data;
    export let form;

    // if the user imported from infinite campus, use those grades instead
    $: if (form?.success) {
        form.data.forEach((term) => {
            let courses = term.courses.map((course, i) => ({
                name: course.name,
                grade: course.grades?.percent || 100,
                id: i,
                weighted: isWeighted(course.name),
            }));

            subjects.update(() => courses);
        });
    }

    // whenever the subject list changes we compute the weighted and unweighted GPAs

    let weightedGPA = derived(subjects, ($subjects) => {
        if ($subjects.length === 0) return 0;

        let totalGrade = 0;
        for (let subject of $subjects) {
            totalGrade += subject.grade;
            if (subject.weighted) {
                totalGrade += 7;
            }
        }

        return totalGrade / $subjects.length;
    });

    let unweightedGPA = derived(subjects, ($subjects) => {
        if ($subjects.length === 0) return 0;

        let totalGrade = 0;
        for (let subject of $subjects) {
            totalGrade += subject.grade;
        }

        return totalGrade / $subjects.length;
    });

    function handleKeydown(event: KeyboardEvent) {
        // only add a new subject if the user presses the "Enter" key
        if (event.key !== "Enter") return;
        let textBox = event.currentTarget as HTMLInputElement;
        // if the user didn't enter anything, don't add a new subject
        if (!textBox.value) return;

        subjects.add(textBox.value, 90); // default grade in 90
        // clear the textbox
        textBox.value = "";
    }

    function getDistrict(name: string): District {
        return data.districts.filter((d: District) => d.district_name == name)[0];
    }

    let dialog: HTMLDialogElement;
    let importing = false;
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

    <input placeholder="enter a subject..." type="text" on:keydown={handleKeydown} />

    <SubjectList {subjects} />

    <button on:click={() => dialog.showModal()}> Import grades from Infinite Campus </button>
    <button on:click={() => subjects.clear()}>Clear</button>
</div>

<Modal bind:dialog>
    <h2 slot="title">Import grades from Infinite Campus</h2>

    <form
        method="post"
        use:enhance={() => {
            importing = true;

            return async ({ update }) => {
                await update();
                importing = false;
                dialog.close();
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

        {#if county}
            <a href={getDistrict(county).student_login_url}>link</a>
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

    {#if importing}
        <span>importing...</span>
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
