<script lang="ts">
	import type { FormattedCategoryGroup } from "$lib/clientHelpers/groupData";
	import SignedIn from "clerk-sveltekit/client/SignedIn.svelte";
	import { onMount } from "svelte";

    const {categories, createNewCategory}: {categories: FormattedCategoryGroup[], createNewCategory: (name: string, groupId: number, userId: string | undefined) => void} = $props();
    let categoryGroups: {showSubGroups: boolean, addNewCategory: boolean}[] = $state([]);
    let newCategoryName = $state("");
    const toggleCategories = (catIndex: number) => {
        categoryGroups[catIndex].showSubGroups = !categoryGroups[catIndex].showSubGroups;
    }
    const toggleNewCategory = (catIndex: number) => {
        categoryGroups[catIndex].addNewCategory = !categoryGroups[catIndex].addNewCategory;
    }
    const addNewCategory = (e: SubmitEvent, groupId: number, userId: string | undefined) => {
        e.preventDefault();
        createNewCategory(newCategoryName, groupId, userId);
        newCategoryName = "";
    }
    onMount(() => {
        categoryGroups = categories.map(() => ({
            showSubGroups: false,
            addNewCategory: false
        }));
    });
    $effect(() => {
        categoryGroups = categories.map(() => ({
            showSubGroups: false,
            addNewCategory: false
        }));
    })
</script>

<SignedIn let:user>
    <table border=1>
        <thead>
        <tr>
            <th>Options</th>
            <th>Category</th>
            <th>Spent</th>
        </tr>
    </thead>
    <tbody>
        {#each categories as category, catIndex}
        <tr>
            <td>
                <button onclick={() => toggleCategories(catIndex)}>Toggle</button>
                <button onclick={() => toggleNewCategory(catIndex)}>Add</button>
            </td>
            <td>{category.name}</td>
            <td>{category.spent}</td>
        </tr>
        {#if categoryGroups.length > 0 && categoryGroups[catIndex].addNewCategory}
        <tr>
            <td colspan="3">
                <form onsubmit={(e) => {addNewCategory(e, category.id, user?.id); categoryGroups[catIndex].addNewCategory = false}}>
                    <input type="text" bind:value={newCategoryName} />
                    <button type="submit">Create</button>
                </form>
            </td>
        </tr>
        {/if}
        {#if categoryGroups.length > 0 && categoryGroups[catIndex].showSubGroups}
        {#each category.subCategories as subCategory}
        <tr>
            <td colspan="3">
                <table>
                    <tbody>
                        <tr>
                                    <td>{subCategory.id}</td>
                                    <td>{subCategory.name}</td>
                                    <td>{subCategory.spent}</td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
                {/each}
                {/if}
                {/each}
            </tbody>
        </table>
    </SignedIn>

        <style>
    table {
        width: 80%;
        margin: 0 auto;
        border-collapse: collapse;
        td, th {
            padding: 0.5rem;
        }
    }
</style>