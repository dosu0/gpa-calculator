<script lang="ts">
    import { settings } from "$stores/settings";
</script>

<div class="board">
    <h1>Settings</h1>

    <label>
        Enable auto-save:
        <input type="checkbox" name="auto-save" bind:checked={$settings.autosave} />
    </label>
</div>

<style>
    .board {
        display: grid;
        max-width: 36em;
        align-items: center;
        margin: 0 auto;
    }
</style>
