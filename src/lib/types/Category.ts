export type CategoryGroups = {
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
    groupId: number;
    userId: string;
    name: string;
    deleted: boolean;
    budgets: { [key: number]: number};
    transactionDate: string;
    createdAt: string;
    updatedAt: string;
}

