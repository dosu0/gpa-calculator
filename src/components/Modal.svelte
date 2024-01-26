<script lang="ts">
    export let show: boolean;

    let dialog: HTMLDialogElement;

    $: if (show && dialog) {
        dialog.showModal();
    }
</script>

<dialog bind:this={dialog} on:close={() => (show = false)}>
    <slot name="title" />
    <hr />
    <slot />
    <hr />
    <button on:click={() => dialog.close()}>close</button>
</dialog>

<style>
    dialog {
        max-width: 40em;
    }
</style>

