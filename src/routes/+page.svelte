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
        let total_grade = 0;
        $subjects.forEach((subject) => {
            total_grade += subject.grade;
        });
        return total_grade / $subjects.length;
    });

    function handleKeydown(event: KeyboardEvent) {
        if (event.key !== "Enter") return;
        let textBox = event.currentTarget as HTMLInputElement;
        subjects.add(textBox.value, 90);
        // clear the textbox
        textBox.value = "";
    }
</script>

<div class="board">
    <h1>GPA: {$gpa}</h1>
    <input placeholder="enter a subject..." type="text" on:keydown={handleKeydown} />

    <SubjectList {subjects} />
</div>

<style>
    .board {
        display: grid;
        max-width: 36em;
        margin: 0 auto;
    }

    .board > input {
        font-size: 1.4em;
        padding: 0.5em;
        margin: 0 0 1rem 0;
    }
</style>
