<script lang="ts">
    export let dialog: HTMLDialogElement;
</script>

<dialog bind:this={dialog}>
    <slot name="title" />
    <hr />
    <slot />
    <hr />
    <button on:click={() => dialog.close()}>Close</button>
</dialog>

<style>
    dialog {
        max-width: 40em;
        border-width: medium;
        border-radius: 0.8em;
        padding: 2rem;
    }

    hr {
        margin-top: 1.5em;
        margin-bottom: 1.5em;
    }

    /* darken background */
    dialog::backdrop {
        background: rgba(0, 0, 0, 0.6);
    }

    /* zoom in animation */
    dialog[open] {
        animation: zoom 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes zoom {
        from {
            transform: scale(0.8);
        }
        to {
            transform: scale(1);
        }
    }
</style>
