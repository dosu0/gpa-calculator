<script lang="ts">
    import Modal from "./Modal.svelte";
    import { enhance } from "$app/forms";
    import type District from "$lib/District";

    export let dialog: HTMLDialogElement;
    export let data: { districts: District[] };

    enum ImportStatus {
        None,
        Loading,
        Error,
        Done,
    }

    let importStatus = ImportStatus.None;

    let county = "Fulton County";

    $: district = data.districts.find((d: District) => d.district_name == county);
</script>

<Modal bind:dialog>
    <h2 slot="title">Import Grades From Infinite Campus</h2>

    <form
        method="post"
        action="?/import"
        use:enhance={() => {
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
        }}
    >
        <label>
            Select a County:
            <select name="district" bind:value={county} required>
                {#each data.districts as district (district.id)}
                    <option>{district.district_name}</option>
                {/each}
            </select>
        </label>

        {#if district}
            <a href={district?.student_login_url}>link</a>
        {/if}

        <br />

        <label>
            Username:
            <input name="username" type="text" autocomplete="username" required />
        </label>
        <br />

        <label>
            Password:
            <input name="password" type="password" autocomplete="current-password" required />
        </label>
        <br />

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
    form {
        display: block;
    }

    span {
        color: green;
    }
</style>
