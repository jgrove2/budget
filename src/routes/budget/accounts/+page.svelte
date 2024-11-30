<script lang="ts">
	import { dev } from "$app/environment";
	import { PUBLIC_REP_LICENSE } from "$env/static/public";
	import type { FormattedCategoryGroup } from "$lib/clientHelpers/groupData";
	import type { Account } from "$lib/types/Account";
	import type { Categories, CategoriesGroups } from "$lib/types/Category";
	import type { Transaction } from "$lib/types/Transaction";
	import SignedIn from "clerk-sveltekit/client/SignedIn.svelte";
	import type { WriteTransaction } from "replicache";
    import {Replicache} from "replicache";
	import { onMount } from "svelte";

	let transactions: Transaction[] = $state([]);
	let accounts: Account[] = $state([]);
    let selectedAccount: number = $state(0);
    let createAccountForm = $state({name: undefined});

	let transaction_db_name = dev ? `dev:transactions` : `transactions`;
	let account_db_name = dev ? `dev:accounts` : `accounts`;

	let replicacheTransactionInstance: Replicache<any>;
	let replicacheAccountInstance: Replicache<any>;
	onMount(() => {
		replicacheTransactionInstance = initReplicache(transaction_db_name);
		replicacheAccountInstance = initReplicache(account_db_name);
	});

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
		} else if (name.includes('category_group')) {
			return new Replicache({
				name,
				licenseKey,
				mutators: {
					create_category_group: async (tx: WriteTransaction, args: Categories) => {
						const key = `category_groups/${args.id}`;
						await tx.set(key, args);
					},
					delete_category_group: async (tx: WriteTransaction, args: Categories) => {
						const key = `category_groups/${args.id}`;
						await tx.set(key, args);
					},
					update_category_group: async (tx: WriteTransaction, args: CategoriesGroups) => {
						const key = `category_groups/${args.id}`;
						await tx.set(key, args);
					}
				}
			});
		} else if(name.includes("account")) {
			return new Replicache({
				name,
				licenseKey,
				mutators: {
					create_account: async (tx: WriteTransaction, args: Account) => {
						const key = `accounts/${args.id}`;
						await tx.set(key, args);
					},
					delete_account: async (tx: WriteTransaction, args: Account) => {
						const key = `accounts/${args.id}`;
						await tx.set(key, args);
					}
				}
			});
		} 
		else {
			return new Replicache({
				name,
				licenseKey,
				mutators: {
					create_category: async (tx: WriteTransaction, args: Categories) => {
						const key = `categories/${args.id}`;
						await tx.set(key, args);
					},
					delete_category: async (tx: WriteTransaction, args: Categories) => {
						const key = `categories/${args.id}`;
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
		return replicacheAccountInstance.subscribe(
			async (tx) => {
				const accountItems = await tx.scan({ prefix: 'accounts/' }).entries().toArray();
				return accountItems
					.map(([_, value]) => value as Account)
					.filter((account) => !account.deleted);
			},
			(items: Account[]) => {
				accounts = items;
			}
		);
	});
    function onSubmitAccount(e: SubmitEvent, userId: string | undefined) {
        e.preventDefault();
        replicacheAccountInstance.mutate.create_account({
            id: new Date().getTime(),
            userId: userId || '',
            name: createAccountForm.name,
            deleted: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        createAccountForm.name = undefined;
    }
</script>
<SignedIn let:user>
    <h1>accounts</h1>
    <form onsubmit={(e) => onSubmitAccount(e, user?.id)}>
        <label for="account-name">Account Name</label>
        <input type="text" id="account-name" name="account-name" required bind:value={createAccountForm.name}/>
        <button type="submit">Create Account</button>
    </form>
    <select bind:value={selectedAccount}>
        {#each accounts as account}
        <option value={account.id}>{account.name}</option>
        {/each}
    </select>
    {#each accounts as account}
        {#if account.id === selectedAccount}
            <h2>{account.name}</h2>
            <table border=1>
                <thead>
                    <tr>
                        <th>Transaction Date</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {#each transactions as transaction}
                    {#if transaction.account === account.id}
                    <tr>
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