import { Replicache, type WriteTransaction } from "replicache";
import { PUBLIC_REP_LICENSE } from '$env/static/public';
import { dev } from "$app/environment";
import type { Categories, CategoryGroups } from "$lib/types/Category";
import { useBudgetState } from "./budgetState.svelte";
const licenseKey = PUBLIC_REP_LICENSE;

export function useCategoryGroups() {
    let categoryGroups: { values: CategoryGroups[] } = $state({ values: [] });
    let replicacheCategoryInstance: Replicache<any> = $state(new Replicache({
        name: dev ? "dev:category_groups" : "category_groups",
        licenseKey,
        mutators: {
            create_category_group: async (tx: WriteTransaction, args: CategoryGroups) => {
                const key = `category_groups/${args.id}`;
                await tx.set(key, args);
            },
            delete_category_group: async (tx: WriteTransaction, args: CategoryGroups) => {
                const key = `category_groups/${args.id}`;
                await tx.set(key, args);
            },
            update_category_group: async (tx: WriteTransaction, args: CategoryGroups) => {
                const key = `category_groups/${args.id}`;
                await tx.set(key, args);
            }
        }
    })
    );
    $effect.root(() => {
        $effect(() => {
            return replicacheCategoryInstance.subscribe(
                async (tx) => {
                    const categoryItems = await tx.scan({ prefix: 'category_groups/' }).entries().toArray();
                    return categoryItems
                        .map(([_, value]) => value as CategoryGroups)
                        .filter((categoryGroup) => !categoryGroup.deleted);
                },
                (items: CategoryGroups[]) => {
                    categoryGroups.values = items;
                }
            );
        });
    })
    return {
        categoryGroups,
        createCategoryGroup: (userId: string, name: string) => {
            replicacheCategoryInstance.mutate.create_category_group({
                id: new Date().getTime(),
                userId: userId,
                name,
                subCategories: [],
                deleted: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                completed: false
            })
        },
        addSubCategory: (categoryId: number, categoryGroupId: number) => {
            let categoryGroup = categoryGroups.values.find(categoryGroup => categoryGroup.id === categoryGroupId)
            if (categoryGroup) {
                replicacheCategoryInstance.mutate.update_category_group({
                    ...categoryGroup,
                    subCategories: [...categoryGroup.subCategories, categoryId]
                })
            } else {
                throw new Error("Category group not found")
            }
        },
        updateCategoryGroup: (categoryGroupId: number, name: string) => {
            let original = categoryGroups.values.find(categoryGroup => categoryGroup.id === categoryGroupId)
            if (original) {
                replicacheCategoryInstance.mutate.update_category_group({
                    ...original,
                    name
                })
            } else {
                throw new Error("Category group not found")
            }
        },
        deleteCategoryGroups: (categoryGroupId: number) => {
            if (categoryGroups.values.some(categoryGroup => categoryGroup.id === categoryGroupId && categoryGroup.subCategories.length === 0)) {
                // delete the category group if there is no sub categories under it
                replicacheCategoryInstance.mutate.delete_category_group({
                    id: categoryGroupId,
                    userId: '',
                    name: '',
                    isSubCategory: false,
                    subCategories: [],
                    deleted: true,
                    createdAt: '',
                    updatedAt: ''
                })
            } else {
                throw new Error("Cannot delete category group if there is still sub categories under it")
            }
        }
    }
}