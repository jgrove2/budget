import type { Categories, CategoriesGroups } from "$lib/types/Category";
import type { Transaction } from "$lib/types/Transaction";
import { CalendarDate, CalendarDateRange } from "calendar-date";

export type FormattedCategoryGroup = {
    id: number;
    name: string;
    subCategories: FormattedCategory[];
    spent: number;
    budget: number;
    budgeted: number;
    showCategories: boolean;
    addNewCategory: boolean;
}
export type FormattedCategory = {
    id: number;
    name: string;
    spent: number;
    createdAt: string;
    selfCategory: Categories;
}

export function createCategoryObject(currentMonth: CalendarDate, categories: Categories[], categoryGroups: CategoriesGroups[], transactions: Transaction[]): FormattedCategoryGroup[] {
    const formattedCategoryGroup: FormattedCategoryGroup[] | undefined = categoryGroups.map((group: CategoriesGroups) => {
        const subCategories = group.subCategories.map((subCategoryId: number) => {
            const category = categories.find((category: Categories) => category.id === subCategoryId);
            if (category) {
                return {
                    id: category.id,
                    name: category.name,
                    spent: transactions?.reduce((acc: number, transaction: Transaction) => {
                        if (transaction.category === category.id) {
                            return acc + transaction.amount;
                        } else {
                            return acc;
                        }
                    }, 0) || 0,
                    createdAt: category.createdAt,
                    selfCategory: category
                }
            }
        }).filter((category: FormattedCategory | undefined) => category !== undefined);
        if (!subCategories) {
            return {
                id: group.id,
                name: group.name,
                subCategories: [],
                spent: 0,
                budgeted: 0,
                budget: 0,
                showCategories: false,
                addNewCategory: false
            }
        }
        return {
            id: group.id,
            name: group.name,
            subCategories: subCategories || [],
            showCategories: false,
            addNewCategory: false,
            budgeted: 0,
            budget: subCategories?.reduce((acc: number, category: FormattedCategory) => {
                        console.log(category.selfCategory?.budgets)
                        if (group.subCategories.includes(category.id)) {
                            let createDate = CalendarDate.fromDateUTC(new Date(category.createdAt))
                            let offset = 0;
                            if (createDate.isAfter(currentMonth)) {
                                offset =  -1 * new CalendarDateRange(currentMonth, createDate).getDifferenceInMonths();
                            } else {
                                offset = new CalendarDateRange(createDate, currentMonth).getDifferenceInMonths();
                            }
                            console.log("offset", offset)
                            let currentBudget = category.selfCategory?.budgets[offset] || 0;
                            return acc + currentBudget;
                        }
                        return acc;
                    }, 0),

            spent: subCategories.reduce((acc: number, category: FormattedCategory) => acc + category.spent, 0)
        }
    });
    return formattedCategoryGroup || [];
}