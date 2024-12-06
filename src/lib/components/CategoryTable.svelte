<script lang="ts">
	import type { FormattedCategoryGroup, FormattedCategory } from '$lib/clientHelpers/groupData';
	import { CalendarDate, CalendarDateRange } from 'calendar-date';
	import SignedIn from 'clerk-sveltekit/client/SignedIn.svelte';
	import { onMount } from 'svelte';
	import BudgetPopup from './BudgetPopup.svelte';
	import type { Replicache } from 'replicache';
	import type { Categories } from '$lib/types/Category';
	import BudgetTable from './BudgetTable.svelte';
	import type { Transaction } from '$lib/types/Transaction';
	import { formatMoney } from '$lib/clientHelpers/formatMoney';

	const {
		categories,
		createNewCategory,
		updateCategory,
		currentMonth,
        transactions
	}: {
		updateCategory: (category: Categories) => void;
		categories: FormattedCategoryGroup[];
		createNewCategory: (
			name: string,
			groupId: number,
			currentMonth: CalendarDate,
			userId: string | undefined
		) => void;
		currentMonth: CalendarDate;
        transactions:  Transaction[];
	} = $props();
    function getTransactionMap(transactions: Transaction[]) {
        let catMap: {[key: number]: Transaction[]} = {};
        for(let i = 0; i < transactions.length; i++) {
            if(transactions[i].category && catMap[transactions[i].category]) {
                catMap[transactions[i].category].push(transactions[i]);
            } else {
                catMap[transactions[i].category] = [transactions[i]];
            }
        }
        return catMap;
    }
	let transactionCategoryMap = $derived(getTransactionMap(transactions));
	let categoryGroups: { showSubGroups: boolean; addNewCategory: boolean }[] = $state([]);
	let newCategoryName = $state('');
	const toggleCategories = (catIndex: number) => {
		categoryGroups[catIndex].showSubGroups = !categoryGroups[catIndex].showSubGroups;
	};
	const toggleNewCategory = (catIndex: number) => {
		categoryGroups[catIndex].addNewCategory = !categoryGroups[catIndex].addNewCategory;
	};
	const addNewCategory = (e: SubmitEvent, groupId: number, userId: string | undefined) => {
		e.preventDefault();
		createNewCategory(newCategoryName, groupId, currentMonth, userId);
		newCategoryName = '';
	};
	onMount(() => {
		categoryGroups = categories.map(() => ({
			showSubGroups: true,
			addNewCategory: false
		}));
	});
	$effect(() => {
		categoryGroups = categories.map(() => ({
			showSubGroups: true,
			addNewCategory: false
		}));
	});
</script>

<SignedIn let:user>
	<table border="1">
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
					<td>{formatMoney(category.spent)}</td>
				</tr>
				{#if categoryGroups?.length > 0 && categoryGroups[catIndex]?.addNewCategory}
					<tr>
						<td colspan="3">
							<form
								onsubmit={(e) => {
									addNewCategory(e, category.id, user?.id);
									categoryGroups[catIndex].addNewCategory = false;
								}}
							>
								<input type="text" bind:value={newCategoryName} />
								<button type="submit">Create</button>
							</form>
						</td>
					</tr>
				{/if}
				{#if categoryGroups.length > 0 && categoryGroups[catIndex].showSubGroups}
					{#each category.subCategories as subCategory: FormattedCategory}
						<BudgetTable {subCategory} {currentMonth} {updateCategory} transactions={transactionCategoryMap[subCategory.id]} />
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
		td,
		th {
			padding: 0.5rem;
		}
	}
</style>
