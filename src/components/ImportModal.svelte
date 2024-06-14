<script lang="ts">
    import Modal from "./Modal.svelte";
    import { enhance } from "$app/forms";
    import type District from "$lib/District";
    import type { SubmitFunction } from "@sveltejs/kit";

    export let dialog: HTMLDialogElement;
    export let data: { districts: District[] };

    enum ImportStatus {
        None,
        Loading,
        Error,
        Done,
    }

    let importStatus = ImportStatus.None;

    let district = "Fulton County";
    let state = "GA";

    const handleImport: SubmitFunction = () => {
        importStatus = ImportStatus.Loading;

        return async ({ result, update }) => {
            if (result.type == "failure" || result.type == "error") {
                importStatus = ImportStatus.Error;
            } else {
                importStatus = ImportStatus.Done;
                dialog.close();
            }

            await update();
        };
    };
</script>

<Modal bind:dialog>
    <h2 slot="title">Import Grades From Infinite Campus</h2>

    <form method="post" action="?/import" use:enhance={handleImport}>
        <!-- TODO: add a dropdown to select 
        <label>
            Select Your State:
            <select name="state" bind:value={state} required> </select>
        </label>
        --->

        <label>
            Select Your District:
            <select name="district" bind:value={district} required>
                {#each data.districts as district (district.id)}
                    <option>{district.district_name}</option>
                {/each}
            </select>
        </label>

        <!-- This isn't really necessary
            {#if district}
                <a href={district?.student_login_url}>link</a>
            {/if} 
        !-->
        <label>
            Username:
            <input name="username" type="text" autocomplete="username" required />
        </label>

        <label>
            Password:
            <input name="password" type="password" autocomplete="current-password" required />
        </label>

        <input type="submit" value="Import" />
    </form>

    {#if importStatus == ImportStatus.Loading}
        <span>importing...</span>
    {:else if importStatus == ImportStatus.Error}
        <span style="color: red;">
            There was a problem logging in. Please make sure your district, username and password
            are correct
        </span>
    {/if}
</Modal>

<style>
    label {
        display: block;
    }

    span {
        color: green;
    }
</style>
