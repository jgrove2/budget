<script lang="ts">
    import { onMount } from 'svelte';
	import SignedIn from 'clerk-sveltekit/client/SignedIn.svelte';
    
    let { categories, createTransaction } = $props();
    let transaction_form = { category: undefined, amount: undefined };
    let dialog: HTMLDialogElement | null;

    onMount(() => {
        dialog = document.getElementById('create-transaction-dialog') as HTMLDialogElement
    });


    function onSubmit(e: SubmitEvent, userId: string | undefined) {
        e.preventDefault();
        createTransaction({
            id: new Date().getTime(),
            userId: userId || '',
            amount: transaction_form.amount,
            category: transaction_form.category,
            deleted: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
    }

</script>
<SignedIn let:user>
    <button class="create-transaction" onclick={() => dialog?.showModal()}>+</button>
    <dialog id="create-transaction-dialog">
        <h2>Create New Transaction</h2>
        <form onsubmit={(e) => {onSubmit(e, user?.id); dialog?.close()}}>
            <label for="transaction-amount">Amount</label>
            <input type="number" id="transaction-amount" step=".01" bind:value={transaction_form.amount} required>
            <label for="transaction-date">Date</label>
            <input type="date" id="transaction-date" name="transaction-date" required>
            <label for="transaction-category">Category</label>
            <select id="transaction-category" name="transaction-category" bind:value={transaction_form.category} required>
                {#each categories as category}
                    <option value={category.id}>{category.name}</option>
                {/each}
            </select>
            <button type="submit">Create</button>
        </form>
        <button class="close-dialog" onclick={() => dialog?.close()}>×</button>
    </dialog>
</SignedIn>
<style>
    .close-dialog {
        position: absolute;
        top: .5rem;
        right: .5rem;
        line-height: 0.5em;
        font-weight: 200;
        border: none;
        background-color: rgba(0, 0, 0, 0);
        font-size: 3em;
        cursor: pointer;
    }
    .create-transaction {
        position: absolute;
        bottom: 1em;
        right: 50vw;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background-color: #007bff;
        color: white;
        font-size: 2em;
        border: none;
        cursor: pointer;
    }
    dialog {
        border-radius: 5px;
        border-width: 1px;
        top: 20em;
    }
    dialog::backdrop {
        background: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.7));
        animation: fade-in 1s;
    }
    dialog form {
        display: flex;
        flex-direction: column;
        gap: 1em;
        padding: 1em;
    }
    @keyframes fade-in {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
</style>