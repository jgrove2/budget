<script lang="ts">
	import { dev } from '$app/environment';
	import { PUBLIC_REP_LICENSE } from '$env/static/public';
	import { createCategoryObject, type FormattedCategoryGroup } from '$lib/clientHelpers/groupData';
	import CategoryTable from '$lib/components/CategoryTable.svelte';
	import CreateTransaction from '$lib/components/CreateTransaction.svelte';
	import type { Account } from '$lib/types/Account';
	import type { Categories, CategoriesGroups } from '$lib/types/Category';
	import type { Transaction } from '$lib/types/Transaction';
	import SignedIn from 'clerk-sveltekit/client/SignedIn.svelte';
	import { Replicache, type WriteTransaction } from 'replicache';
	import { onMount } from 'svelte';


	let categoryGroup: CategoriesGroups[] = $state([]);
	let transactions: Transaction[] = $state([]);
	let categories: Categories[] = $state([]);
	let accounts: Account[] = $state([]);
	let formattedCategories: FormattedCategoryGroup[] = $derived(createCategoryObject(categories, categoryGroup, transactions));
	let category_group_form = $state({ name: undefined });
	let category_form = $state({ name: undefined, category_group: undefined });

	let transaction_db_name = dev ? `dev:transactions` : `transactions`;
	let category_group_db_name = dev ? `dev:category_group` : `category_group`;
	let category_db_name = dev ? `dev:categories` : `categories`;
	let account_db_name = dev ? `dev:accounts` : `accounts`;

	let replicacheTransactionInstance: Replicache<any>;
	let replicacheCategoryInstance: Replicache<any>;
	let replicacheCategoryGroupInstance: Replicache<any>;
	let replicacheAccountInstance: Replicache<any>;
	onMount(() => {
		replicacheTransactionInstance = initReplicache(transaction_db_name);
		replicacheCategoryInstance = initReplicache(category_db_name);
		replicacheCategoryGroupInstance = initReplicache(category_group_db_name);
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

	function onSubmitCategoryGroup(e: SubmitEvent, userId: string | undefined) {
		e.preventDefault();
		replicacheCategoryGroupInstance.mutate.create_category_group({
			id: new Date().getTime(),
			userId: userId,
			name: category_group_form.name,
			subCategories: [],
			deleted: false,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			completed: false
		});
		category_group_form.name = undefined;
	}

	function createNewCategory(name: string, groupId: number, userId: string | undefined) {
		let categoryId = new Date().getTime();
		let updatedCategorySelected = categoryGroup.find((group) => group.id === groupId);
		if(updatedCategorySelected) {
			replicacheCategoryInstance.mutate.create_category({
				id: categoryId,
				userId: userId,
				name: name,
				deleted: false,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				completed: false
			});
			replicacheCategoryGroupInstance.mutate.update_category_group({
				...updatedCategorySelected,
				subCategories: [...updatedCategorySelected.subCategories, categoryId]
			})
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
		return replicacheCategoryGroupInstance.subscribe(
			async (tx) => {
				const categoryItems = await tx.scan({ prefix: 'category_groups/' }).entries().toArray();
				return categoryItems
					.map(([_, value]) => value as CategoriesGroups)
					.filter((categories) => !categories.deleted);
			},
			(items: CategoriesGroups[]) => {
				categoryGroup = items;
			}
		);
	});
	$effect(() => {
		return replicacheCategoryInstance.subscribe(
			async (tx) => {
				const categoryItems = await tx.scan({ prefix: 'categories/' }).entries().toArray();
				return categoryItems
					.map(([_, value]) => value as Categories)
					.filter((categories) => !categories.deleted);
			},
			(items: Categories[]) => {
				categories = items;
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
</script>

<SignedIn let:user>
	<CreateTransaction categories={categories} createTransaction={replicacheTransactionInstance.mutate.create_transaction} {accounts}/>
	<h1>home</h1>
	<h2>Category Group</h2>
	<form method="POST" onsubmit={(e) => onSubmitCategoryGroup(e, user?.id)}>
		<label for="name">Name:</label>
		<input type="text" id="name" bind:value={category_group_form.name} />
        <button type="submit">Add Category Group</button>
	</form>
	<section>
		<CategoryTable categories={formattedCategories} {createNewCategory}/>
	</section>
</SignedIn>
