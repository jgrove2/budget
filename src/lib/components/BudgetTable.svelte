<script lang="ts">
	import { CalendarDate, CalendarDateRange } from 'calendar-date';
	import BudgetPopup from './BudgetPopup.svelte';
	import type { Transaction } from '$lib/types/Transaction';
	import type { FormattedCategory } from '$lib/clientHelpers/groupData';
	import { formatMoney } from '$lib/clientHelpers/formatMoney';
	import { useTransactions } from '$lib/context/transactions.svelte';
	import { useCategory } from '$lib/context/categories.svelte';
	import { useBudgetState } from '$lib/context/budgetState.svelte';

	const {
		subCategory,
		currentMonth,
		spent
	}: {
		subCategory: FormattedCategory;
		currentMonth: CalendarDate;
		spent: { [key: number]: number };
	} = $props();
	let { editBudget } = useCategory();
	let currentOffset = $derived.by(() => {
		let createDate = CalendarDate.fromDateUTC(new Date(subCategory.createdAt));
		if (createDate.isAfter(currentMonth)) {
			return -1 * new CalendarDateRange(currentMonth, createDate).getDifferenceInMonths();
		} else {
			return new CalendarDateRange(createDate, currentMonth).getDifferenceInMonths();
		}
	});
	let currentBudget = $derived.by(() => {
		return subCategory.selfCategory.budgets[currentOffset] || 0;
	});
	let totalSpent = $derived.by(() => {
		let total = 0;
		let s = spent || {};
		Object.keys(s).forEach((key) => {
			let k = parseInt(key);
			if (k <= currentOffset) {
				total += s[k];
			}
		});
		return total;
	});
	let totalBudget = $derived.by(() => {
		let total = 0;
		let b = subCategory.selfCategory.budgets || {};
		Object.keys(b).forEach((key) => {
			let k = parseInt(key);
			if (k <= currentOffset) {
				total += b[k] || 0;
			}
		});
		return total;
	});
</script>

<tr>
	<td colspan="2">{subCategory.name}</td>
	<td
		>{spent
			? spent[currentOffset]
				? formatMoney(spent[currentOffset])
				: formatMoney(0)
			: formatMoney(0)}</td
	>
	<td>
		<BudgetPopup
			setBudget={(budget: number) => {
				editBudget(subCategory.id, currentOffset, budget);
			}}
			{currentBudget}
		/>
	</td>
	<td>{formatMoney(totalBudget + totalSpent)}</td>
</tr>
