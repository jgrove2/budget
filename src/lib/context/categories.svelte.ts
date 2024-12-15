import { Replicache, type WriteTransaction } from "replicache";
import { PUBLIC_REP_LICENSE } from '$env/static/public';
import { dev } from "$app/environment";
import type { Categories } from "$lib/types/Category";
import { useCategoryGroups } from "./categoryGroups.svelte";
import { useBudgetState } from "./budgetState.svelte";
import { useTransactions } from "./transactions.svelte";
import { CalendarDate, CalendarDateRange } from "calendar-date";
const licenseKey = PUBLIC_REP_LICENSE;

export function useCategory() {
    let { addSubCategory } = useCategoryGroups()
    let { transactions } = useTransactions();
    let { budgetState } = useBudgetState();
    let categories: { values: Categories[] } = $state({ values: []});
    let replicacheCategoryInstance: Replicache<any> = $state(new Replicache({
        name: dev ? "dev:categories" : "categories",
        licenseKey,
        mutators: {
            create_category: async (tx: WriteTransaction, args: Categories) => {
                const key = `categories/${args.id}`;
                await tx.set(key, args);
            },
            delete_category: async (tx: WriteTransaction, args: Categories) => {
                const key = `categories/${args.id}`;
                await tx.set(key, args);
            },
            update_category: async (tx: WriteTransaction, args: Categories) => {
                const key = `categories/${args.id}`;
                await tx.set(key, args);
            }
        }
    }));
    $effect.root(() => {
        $effect(() => {
            return replicacheCategoryInstance.subscribe(
                async (tx) => {
                    const categoryItems = await tx.scan({ prefix: 'categories/' }).entries().toArray();
                    return categoryItems
                        .map(([_, value]) => value as Categories)
                        .filter((category) => !category.deleted);
                },
                (items: Categories[]) => {
                    categories.values = items;
                }
            );
        });
    })
    
    return {
        categories,
        createCategory: (userId: string, name: string, categoryGroup: number, transactionDate: string) => {
            let catId = new Date().getTime()
            let newCategory = {
                id: catId,
                groupId: categoryGroup,
                userId: userId,
                name: name,
                deleted: false,
                transactionDate: transactionDate,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                completed: false,
                budgets: { 0: 0 }
            }
            replicacheCategoryInstance.mutate.create_category(newCategory)
            addSubCategory(catId, categoryGroup)
        },
        editBudget: (categoryId: number, month: number, updatedBudget: number) => {
            let category_group = categories.values.find(category => category.id === categoryId)
            if (!category_group) {
                throw new Error('Category not found')
            }
            replicacheCategoryInstance.mutate.update_category({
                ...category_group,
                budgets: { ...category_group.budgets, [month]: updatedBudget }
            })
        },
        updateCategoryName: (categoryId: number, updatedName: string) => {
            let category = categories.values.find(category => category.id === categoryId)
            if (!category) {
                throw new Error('Category not found')
            }
            replicacheCategoryInstance.mutate.update_category({
                ...category,
                name: updatedName
            })
        }
    }
}