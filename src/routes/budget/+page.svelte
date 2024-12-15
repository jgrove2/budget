<script lang="ts">
	import { createCategoryObject, type FormattedCategoryGroup } from '$lib/clientHelpers/groupData';
	import CategoryTable from '$lib/components/CategoryTable.svelte';
	import CreateTransaction from '$lib/components/CreateTransaction.svelte';
	import type { Transaction } from '$lib/types/Transaction';
	import SignedIn from 'clerk-sveltekit/client/SignedIn.svelte';
	import { CalendarDate, CalendarDateRange } from 'calendar-date';
	import { formatMoney } from '$lib/clientHelpers/formatMoney';
	import { useTransactions } from '$lib/context/transactions.svelte';
	import { useCategory } from '$lib/context/categories.svelte';
	import { useCategoryGroups } from '$lib/context/categoryGroups.svelte';
	import type { Categories } from '$lib/types/Category';
	import { useBudgetState } from '$lib/context/budgetState.svelte';


	let {categories } = useCategory();
	let {transactions} = useTransactions();
	let {categoryGroups, createCategoryGroup} = useCategoryGroups();
	let category_group_form = $state({ name: undefined });
	let selectedMonth = $state(CalendarDate.nowLocal());
	let formattedCategories: FormattedCategoryGroup[] = $derived(createCategoryObject(selectedMonth, categories.values, categoryGroups.values, transactions.values  ));

	function onSubmitCategoryGroup(e: SubmitEvent, userId: string | undefined) {
		e.preventDefault();
		if(userId && category_group_form.name)
			createCategoryGroup(userId, category_group_form.name);
		category_group_form.name = undefined;
	}
	let offset = $derived.by(() => {
        let currentMonth = CalendarDate.nowLocal()
        if(currentMonth.isBefore(currentMonth)) {
            return new CalendarDateRange(selectedMonth, currentMonth).getDifferenceInMonths()
        } else if(selectedMonth) {
            return new CalendarDateRange(currentMonth, selectedMonth).getDifferenceInMonths()
        }
    })
	let totalBalance = $derived.by(() => {
		let totalIncome = 0;
		let totalSubtract = 0;
		let totalBudget = 0;

		transactions.values?.forEach((transaction: Transaction) => {
			let creationDate = CalendarDate.fromDateUTC(new Date(transaction.transactionDate));
			if(creationDate.isBeforeOrEqual(selectedMonth.getLastDayOfMonth())) {
				if(transaction.amount <= 0)
					totalSubtract -= transaction.amount;
				else
					totalIncome += transaction.amount
			}
		})
		categories.values?.forEach((category: Categories) => {
			let createAt = CalendarDate.fromDateLocal(new Date(category.createdAt))
			let currentMonth = CalendarDate.nowLocal();
			if (currentMonth.isAfter(createAt)) {
				let offset =  -1 * new CalendarDateRange( createAt, currentMonth).getDifferenceInMonths();
				totalBudget += category.budgets[offset]
			} else {
				let offset = new CalendarDateRange(currentMonth, createAt).getDifferenceInMonths();
				totalBudget += category.budgets[offset]
			}
		})
		if(totalSubtract > totalBudget) {
			return totalIncome - totalSubtract
		}
		return totalIncome - totalBudget
	})
	let monthsIncome = $derived(() => {
		let total = 0;
		transactions.values?.forEach((transaction: Transaction) => {
			let creationDate = CalendarDate.fromDateUTC(new Date(transaction.transactionDate));
			if(creationDate.isBeforeOrEqual(selectedMonth.getLastDayOfMonth()) && creationDate.isAfterOrEqual(selectedMonth.getFirstDayOfMonth())) {
				if(transaction.category === -2) {
					total += transaction.amount;
				}
			}
		})
		return total;
	})



</script>

<SignedIn let:user>
	<h4>{formatMoney(totalBalance)}</h4>
	<button onclick={() => selectedMonth = selectedMonth.addMonths(-1)}>{"<"}</button>
    <span>{selectedMonth.toFormat("MM-yyyy")}</span>
    <button onclick={() => selectedMonth = selectedMonth.addMonths(1)}>{">"}</button>
    
	<CreateTransaction/>
	<h1>home</h1>
	<h2>Category Group</h2>
	<form method="POST" onsubmit={(e) => onSubmitCategoryGroup(e, user?.id)}>
		<label for="name">Name:</label>
		<input type="text" id="name" bind:value={category_group_form.name} />
        <button type="submit">Add Category Group</button>
	</form>
	<section>
		<CategoryTable formattedCategories={formattedCategories} currentMonth={selectedMonth}/>
	</section>
	<section>
		<table>
			<thead>
				<tr>
					<th>Category</th>
					<th>Received</th>
				</tr>
				</thead>
				<tbody>
					<tr>
						<td>
							Income
						</td>
						<td>
							{formatMoney(monthsIncome())}
						</td>
					</tr>
				</tbody>
		</table>
		</section>
</SignedIn>
