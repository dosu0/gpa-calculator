<script lang="ts">
    export let show: boolean;
    import { slide } from "svelte/transition";

    let dialog: HTMLDialogElement;

    $: if (show && dialog) { dialog.showModal() }
</script>

<dialog 
    bind:this={dialog}  
    on:close={() => show=false}
    >
    <slot name="title" />
    <hr />
    <slot />
    <hr />

    <button on:click={() => dialog.close()}>close</button>
</dialog>