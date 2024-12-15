<script lang="ts">
	import type { FormattedCategoryGroup, FormattedCategory } from '$lib/clientHelpers/groupData';
	import { CalendarDate, CalendarDateRange } from 'calendar-date';
	import SignedIn from 'clerk-sveltekit/client/SignedIn.svelte';
	import { onMount } from 'svelte';
	import type { Categories } from '$lib/types/Category';
	import BudgetTable from './BudgetTable.svelte';
	import type { Transaction } from '$lib/types/Transaction';
	import { formatMoney } from '$lib/clientHelpers/formatMoney';
	import { useTransactions } from '$lib/context/transactions.svelte';
	import { useCategory } from '$lib/context/categories.svelte';

	const {
		formattedCategories,
		currentMonth,
	}: {
		formattedCategories: FormattedCategoryGroup[];
		currentMonth: CalendarDate;
	} = $props();
	let {transactions} = useTransactions();
	let {createCategory} = useCategory();
    
	let categoryGroups: { showSubGroups: boolean; addNewCategory: boolean }[] = $state([]);
	function getTotalSpentInMonth(categoryGroup: FormattedCategoryGroup) {
		if(transactions.spent === undefined) return 0;
		let total = 0;
		for(let i = 0; i < categoryGroup.subCategories.length; i++) {
			if(transactions.spent[categoryGroup.subCategories[i].id] === undefined) continue;
			total += transactions.spent[categoryGroup.subCategories[i].id][0] || 0
		}	
		return total
	}
	let newCategoryName = $state('');
	const toggleCategories = (catIndex: number) => {
		categoryGroups[catIndex].showSubGroups = !categoryGroups[catIndex].showSubGroups;
	};
	const toggleNewCategory = (catIndex: number) => {
		categoryGroups[catIndex].addNewCategory = !categoryGroups[catIndex].addNewCategory;
	};
	const addNewCategory = (e: SubmitEvent, groupId: number, userId: string | undefined) => {
		e.preventDefault();
		if(userId)
			createCategory(userId, newCategoryName, groupId);
		newCategoryName = '';
	};
	onMount(() => {
		categoryGroups = formattedCategories.map(() => ({
			showSubGroups: true,
			addNewCategory: false
		}));
	});
	$effect(() => {
		categoryGroups = formattedCategories.map(() => ({
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
                <th>Budgeted</th>
                <th>Balance</th>
			</tr>
		</thead>
		<tbody>
			{#each formattedCategories as categoryGroup, catIndex}
				<tr>
					<td>
						<button onclick={() => toggleCategories(catIndex)}>Toggle</button>
						<button onclick={() => toggleNewCategory(catIndex)}>Add</button>
					</td>
					<td>{categoryGroup.name}</td>
					<td>{formatMoney(getTotalSpentInMonth(categoryGroup))}</td>
                    <td>{categoryGroup.budget}</td>
                    <td>{formatMoney(categoryGroup.budget + getTotalSpentInMonth(categoryGroup))}</td>
				</tr>
				{#if categoryGroups?.length > 0 && categoryGroups[catIndex]?.addNewCategory}
					<tr>
						<td colspan="5">
							<form
								onsubmit={(e) => {
									addNewCategory(e, categoryGroup.id, user?.id);
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
					{#each categoryGroup.subCategories as subCategory: FormattedCategory}
						<BudgetTable {subCategory} {currentMonth} spent={transactions.spent[subCategory.id]} />
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
