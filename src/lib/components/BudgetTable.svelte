<script lang="ts">
	import { CalendarDate, CalendarDateRange } from "calendar-date";
	import BudgetPopup from "./BudgetPopup.svelte";
	import type { Transaction } from "$lib/types/Transaction";
	import type { FormattedCategory } from "$lib/clientHelpers/groupData";
	import { formatMoney } from "$lib/clientHelpers/formatMoney";

 const { subCategory, currentMonth, updateCategory, transactions }: {subCategory: FormattedCategory, currentMonth: CalendarDate, updateCategory: any, transactions: Transaction[]}= $props();
 let currentOffset = $derived(() => {
     let createDate = CalendarDate.fromDateUTC(new Date(subCategory.createdAt))
     if(createDate.isAfter(currentMonth)) {
         return -1 * new CalendarDateRange(currentMonth, createDate).getDifferenceInMonths();
     } else {
         return new CalendarDateRange(createDate, currentMonth).getDifferenceInMonths();
     }
 })
 let currentBudget = $derived(() => {
    return subCategory.selfCategory.budgets[currentOffset()] || 0;
 })
 let totalSpent = $derived(() => {
        let total = 0;
        let offsets = Object.keys(subCategory.selfCategory.budgets).map((offset) => parseInt(offset));
        console.log(subCategory.selfCategory.budgets)
        for(let i = 0; i < offsets.length; i++) {
            if(offsets[i] <= currentOffset()) {
                total += subCategory.selfCategory.budgets[offsets[i]];
            }
        }
        transactions?.forEach((transaction: Transaction) => {
            let creationDate = CalendarDate.fromDateUTC(new Date(subCategory.createdAt));
            if(creationDate.isBeforeOrEqual(currentMonth.getLastDayOfMonth())) {
                total += transaction.amount;
            }
        })
        return total;
 })
 let spentThisMonth = $derived(() => {
    let total = 0;
    transactions?.forEach((transactions: Transaction) => {
        let creationDate = CalendarDate.fromDateUTC(new Date(subCategory.createdAt));
        if(creationDate.isBeforeOrEqual(currentMonth.getLastDayOfMonth()) && creationDate.isAfterOrEqual(currentMonth.getFirstDayOfMonth())) {
            total += transactions.amount;
        }
    })
    return total;
 })

</script>

<tr>
            <td colspan="3">
                <table>
                    <tbody>
                        <tr>
                                    <td>{subCategory.name}</td>
                                    <td>{formatMoney(spentThisMonth())}</td>
                                    <td>
                                    <BudgetPopup setBudget={(budget: number) => {
                                        let createDate = CalendarDate.fromDateUTC(new Date(subCategory.createdAt))
                                        if(createDate.isAfter(currentMonth)) {
                                            updateCategory({
                                                ...subCategory.selfCategory,
                                                budgets: {...subCategory.selfCategory.budgets, [currentOffset()]: budget}
                                            })
                                        } else {
                                            updateCategory({
                                                ...subCategory.selfCategory,
                                                budgets: {...subCategory.selfCategory.budgets, [currentOffset()]: budget}
                                            })
                                        }}}
                                        currentBudget={currentBudget()}
                                        />
                                    </td>
                                    <td>{formatMoney(totalSpent())}</td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>