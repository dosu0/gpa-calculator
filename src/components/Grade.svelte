<script lang="ts">
    export let grade: number;
    import { gradeColor } from "$lib/utils";
</script>

<span style="color: {gradeColor(grade)}">
    {grade.toFixed(2)}
</span>
