<script lang="ts">
    import Modal from "$components/Modal.svelte";
    import { gradeColor } from "$lib/utils";
    import { weightedGPA, unweightedGPA, lowestGrade, highestGrade } from "$stores/subjects";
    import Grade from "./Grade.svelte";

    export let dialog: HTMLDialogElement;
</script>

<Modal bind:dialog>
    <h2 slot="title">Grade Report</h2>

    <p>
        <b>GPA:</b>
        <Grade grade={$weightedGPA} />
    </p>
    <p>
        <b>Unweighted GPA:</b>
        <Grade grade={$unweightedGPA} />
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
