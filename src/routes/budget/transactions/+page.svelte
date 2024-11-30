<script lang="ts">
	import { dev } from "$app/environment";
	import { PUBLIC_REP_LICENSE } from "$env/static/public";
	import type { FormattedCategoryGroup } from "$lib/clientHelpers/groupData";
	import type { Payee } from "$lib/types/Payee";
	import type { Categories, CategoriesGroups } from "$lib/types/Category";
	import type { Transaction } from "$lib/types/Transaction";
	import SignedIn from "clerk-sveltekit/client/SignedIn.svelte";
	import type { WriteTransaction } from "replicache";
    import {Replicache} from "replicache";
	import type {Replicache as ReplicacheType} from "replicache";
	import { onMount } from "svelte";

	let transactions: Transaction[] = $state([]);
	let payees: Payee[] = $state([]);
    let selectedPayee: number = $state(-1);
    let createPayeeForm = $state({name: undefined});

	let transaction_db_name = dev ? `dev:transactions` : `transactions`;
	let payee_db_name = dev ? `dev:payees` : `payees`;

	let replicacheTransactionInstance: ReplicacheType<any>;
	let replicachePayeeInstance: ReplicacheType<any>;
	onMount(() => {
		replicacheTransactionInstance = initReplicache(transaction_db_name);
		replicachePayeeInstance = initReplicache(payee_db_name);
	});
	$inspect(selectedPayee)

	function initReplicache(name: string) {
		const licenseKey = PUBLIC_REP_LICENSE;
		if (name.includes('transactions')) {
			return new Replicache({
				name,
				licenseKey,
				mutators: {
					create_transaction: async (tx: WriteTransaction, args: Transaction) => {
						const key = `transactions/${args.id}`;
						await tx.set(key, args);
					},
					delete_transaction: async (tx: WriteTransaction, args: Transaction) => {
						const key = `transactions/${args.id}`;
						await tx.set(key, args);
					}
				}
			});
		}
		 else{
			return new Replicache({
				name,
				licenseKey,
				mutators: {
					create_payee: async (tx: WriteTransaction, args: Payee) => {
						const key = `payees/${args.id}`;
						await tx.set(key, args);
					},
					delete_payee: async (tx: WriteTransaction, args: Payee) => {
						const key = `payees/${args.id}`;
						await tx.set(key, args);
					}
				}
			});
		} 
	}

	$effect(() => {
		return replicacheTransactionInstance.subscribe(
			async (tx) => {
				const transaction_items = await tx.scan({ prefix: 'transactions/' }).entries().toArray();
				return transaction_items
					.map(([_, value]) => value as Transaction)
					.filter((transactions) => !transactions.deleted);
			},
			(items: Transaction[]) => {
				transactions = items;
			}
		);
	});
	$effect(() => {
		return replicachePayeeInstance.subscribe(
			async (tx) => {
				const payeeItems = await tx.scan({ prefix: 'payees/' }).entries().toArray();
				return payeeItems
					.map(([_, value]) => value as Payee)
					.filter((payee) => !payee.deleted);
			},
			(items: Payee[]) => {
				payees = items;
			}
		);
	});
    function onSubmitPayee(e: SubmitEvent, userId: string | undefined) {
        e.preventDefault();
        replicachePayeeInstance.mutate.create_payee({
            id: new Date().getTime(),
            userId: userId || '',
            name: createPayeeForm.name,
            deleted: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        createPayeeForm.name = undefined;
    }
</script>
<SignedIn let:user>
    <h1>Transactions</h1>
    <form onsubmit={(e) => onSubmitPayee(e, user?.id)}>
        <label for="payee-name">Payee Name</label>
        <input type="text" id="payee-name" name="payee-name" required bind:value={createPayeeForm.name}/>
        <button type="submit">Create Account</button>
    </form>
    <select bind:value={selectedPayee}>
		<option value={-1}>All</option>
        {#each payees as payee}
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
                    {#each transactions as transaction}
                    <tr>
						<td>{payees.find((payee) => payee.id === transaction.payee)?.name || "Unknown"}</td>
                        <td>{transaction.transactionDate}</td>
                        <td>{transaction.amount}</td>
                    </tr>
                    {/each}
                </tbody>
            </table>
	{/if}
    {#each payees as payee}
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
                    {#each transactions as transaction}
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