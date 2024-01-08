<script lang="ts">
    import { createSubjectList } from "./subjects";
    import SubjectList from "./SubjectList.svelte";
    import { derived } from "svelte/store";

    let subjects = createSubjectList([
        { name: "AP Calculus", grade: 90 },
        { name: "Spanish 3", grade: 85 },
        { name: "AP Computer Science A", grade: 100 },
        { name: "10th Lit", grade: 94 },
    ]);
    
    let gpa = derived(subjects, ($subjects) => {
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
</script>

<div class="board">
    <h1>GPA: {$gpa}</h1>
    <input placeholder="enter a subject..." type="text" 
        on:keydown={handleKeydown} />

    <SubjectList {subjects} />
</div>

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
        margin: 0 0 1rem 0;
    }
</style>
