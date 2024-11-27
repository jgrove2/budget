export type Transaction = {
		id: number;
		userId: string;
		amount: number;
		category: number;
		deleted: boolean;
		createdAt: string;
		updatedAt: string;
		completed: boolean;
	};

export type TransactionReplicache = {
	name: string;
	liscenseKey: string;
	mutators: {
		createTransaction: (txn: Transaction) => void;
		deleteTransaction: (txn: Transaction) => void;
	}
}