<!-- This is the home page -->

<script lang="ts">
    import { createSubjectList } from "./subjects";
    import SubjectList from "$components/SubjectList.svelte";
    import Modal from "$components/Modal.svelte";
    import { derived } from "svelte/store";
    import { onMount } from "svelte";

    
    let subjects = createSubjectList([
        { name: "AP Calculus", grade: 98 },
        { name: "Spanish 3", grade: 98},
        { name: "AP Computer Science A", grade: 100 },
        { name: "10th Lit", grade: 94 },
        { name: "AP Lang", grade: 80},
    ]);
    
    // whenever the subject list changes we compute the weighted and unweighted GPAs
    
    let weightedGPA = derived(subjects, ($subjects) => {
        if ($subjects.length === 0)
            return 0;
    
        let totalGrade = 0;
        for (let subject of $subjects) {
            totalGrade += subject.grade;
        }

        return totalGrade / $subjects.length;
    });


    let unweightedGPA = derived(subjects, ($subjects) => {
        if ($subjects.length === 0)
            return 0;
        
        let totalGrade = 0;
        for (let subject of $subjects) {
            totalGrade += subject.grade;
            if (subject.weighted) {
                totalGrade -= 7;
            }
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
        console.log($subjects);
    }

    function save() {
        // save the subjects to local storage
        // TODO: we might have to save them to a database too
        localStorage.setItem('subjects', JSON.stringify($subjects));
    }

    function load() {
        const loaded = JSON.parse(localStorage.getItem('subjects'));

        if (loaded) {
            subjects = createSubjectList(loaded);
        }

    }
    
    let showImportDialog = false;

    onMount(load);
</script>

<div class="board">
    <!-- round GPAs to two decimal places -->
    <h2>GPA: {$weightedGPA.toFixed(2)}</h2>
    <h2>Unweighted GPA: {$unweightedGPA.toFixed(2)}</h2>
    <input placeholder="enter a subject..." type="text" on:keydown={handleKeydown} />

    <SubjectList {subjects} />

    <button on:click={() => showImportDialog = true}>
        import grades from infinite campus
    </button>
    <button on:click={save}>save</button>
    <button on:click={load}>load</button>
    <button on:click={() => subjects.clear()}>clear</button>
</div>

<Modal bind:show={showImportDialog} >
    <h2 slot="title">Import grades from infinite campus</h2>
    <p>work in progress</p>
    <input type="text" placeholder="enter your school district" />
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
        margin: 0 0 1.0rem 0rem;
    }

    .board > button {
        padding: 0.5em;
        margin: 0 0 0.5rem 0;
        margin-left: 3rem;
    }
    
    input {
        width: 100%;
    }

</style>
