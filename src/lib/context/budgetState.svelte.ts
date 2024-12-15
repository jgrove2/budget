import type { FormattedCategoryGroup } from "$lib/clientHelpers/groupData";
import type { Categories, CategoryGroups } from "$lib/types/Category";
import type { Transaction } from "$lib/types/Transaction";
import { CalendarDate, CalendarDateRange } from "calendar-date";
import { useCategory } from "./categories.svelte";
import { usePayees } from "./payees.svelte";
import { useTransactions } from "./transactions.svelte";

export function useBudgetState() {
    let budgetState: { selectedMonth: CalendarDate | undefined } = $state({ selectedMonth: CalendarDate.nowLocal() })
    let offset = $derived.by(() => {
        let currentMonth = CalendarDate.nowLocal()
        if(budgetState.selectedMonth && budgetState.selectedMonth.isBefore(currentMonth)) {
            return new CalendarDateRange(budgetState.selectedMonth, currentMonth).getDifferenceInMonths()
        } else if(budgetState.selectedMonth) {
            return new CalendarDateRange(currentMonth, budgetState.selectedMonth).getDifferenceInMonths()
        }
    })
    return {
        budgetState,
        offset,
        setSelectedMonth: (month: CalendarDate) => {
            budgetState.selectedMonth = month
        }
    }
}