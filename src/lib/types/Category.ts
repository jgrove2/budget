export type CategoriesGroups = {
    id: number;
    userId: string;
    name: string;
    isSubCategory: boolean;
    subCategories: number[];
    deleted: boolean;
    createdAt: string;
    updatedAt: string;
};

export type Categories = {
    id: number;
    userId: string;
    name: string;
    deleted: boolean;
    budgets: {number: number};
    createdAt: string;
    updatedAt: string;
}

