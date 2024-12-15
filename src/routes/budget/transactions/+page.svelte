<script lang="ts">
	import SignedIn from "clerk-sveltekit/client/SignedIn.svelte";
	import { useTransactions } from "$lib/context/transactions.svelte";
	import { usePayees } from "$lib/context/payees.svelte";

    let selectedPayee: number = $state(-1);
    let createPayeeForm = $state({name: undefined});
	let {transactions} = useTransactions();
    let {payees, createPayee} = usePayees();

    function onSubmitPayee(e: SubmitEvent, userId: string | undefined) {
        e.preventDefault();
        if(userId && createPayeeForm.name)
            createPayee(userId, createPayeeForm.name)
        createPayeeForm.name = undefined;
    }
</script>
<SignedIn let:user>
    <h1>Transactions</h1>
    <form onsubmit={(e) => onSubmitPayee(e, user?.id)}>
        <label for="payee-name">Payee Name</label>
        <input required type="text" id="payee-name" name="payee-name" bind:value={createPayeeForm.name}/>
        <button type="submit">Create Account</button>
    </form>
    <select bind:value={selectedPayee}>
		<option value={-1}>All</option>
        {#each payees.values as payee}
        <option value={payee.id}>{payee.name}</option>
        {/each}
    </select>
	{#if selectedPayee === -1}
		<h2>All Transactions</h2>
            <table border=1>
                <thead>
                    <tr>
						<th>Payee</th>
                        <th>Transaction Date</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {#each transactions.values as transaction}
                    <tr>
						<td>{payees.values.find((payee) => payee.id === transaction.payee)?.name || "Unknown"}</td>
                        <td>{transaction.transactionDate}</td>
                        <td>{transaction.amount}</td>
                    </tr>
                    {/each}
                </tbody>
            </table>
	{/if}
    {#each payees.values as payee}
		{#if payee.id === selectedPayee}
            <h2>{payee.name}</h2>
            <table border=1>
                <thead>
                    <tr>
						<th>Payee</th>
                        <th>Transaction Date</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {#each transactions.values as transaction}
                    {#if transaction.payee === payee.id}
                    <tr>
						<td>{payee.name}</td>
                        <td>{transaction.transactionDate}</td>
                        <td>{transaction.amount}</td>
                    </tr>
                    {/if}
                    {/each}
                </tbody>
            </table>
        {/if}
    {/each}
</SignedIn>