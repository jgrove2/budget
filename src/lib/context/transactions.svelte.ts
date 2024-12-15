import type { Transaction } from "$lib/types/Transaction";
import { Replicache, type WriteTransaction } from "replicache";
import { PUBLIC_REP_LICENSE } from '$env/static/public';
import { dev } from "$app/environment";
import { CalendarDate, CalendarDateRange } from "calendar-date";
const licenseKey = PUBLIC_REP_LICENSE;

export function useTransactions() {
    let transactions: { values: Transaction[], transactionCategories: {[key: number]: Transaction[]}, spent: {[key: number]: {[key: number]: number}} } = $state({ values: [], transactionCategories: {}, spent: {} });
    let replicacheTransactionInstance: Replicache<any> = $state(new Replicache({
        name: dev ? "dev:transactions" : "transactions",
        licenseKey,
        mutators: {
            create_transaction: async (tx: WriteTransaction, args: Transaction) => {
                const key = `transactions/${args.id}`;
                await tx.set(key, args);
            },
            delete_transaction: async (tx: WriteTransaction, args: Transaction) => {
                const key = `transactions/${args.id}`;
                await tx.set(key, args);
            }
        }
    }));
    $effect.root(() => {
        $effect(() => {
            return replicacheTransactionInstance.subscribe(
                async (tx) => {
                    const transaction_items = await tx.scan({ prefix: 'transactions/' }).entries().toArray();
                    return transaction_items
                        .map(([_, value]) => value as Transaction)
                        .filter((transactions) => !transactions.deleted);
                },
                (items: Transaction[]) => {
                    transactions.values = items;
                    for(let i = 0; i < items.length; i++) {
                        if(!transactions.transactionCategories[items[i].category]) {
                            transactions.transactionCategories[items[i].category] = []
                        }
                        transactions.transactionCategories[items[i].category].push(items[i])
                }}
            );
        });
        $effect(() => {
            let spent : { [key: number]: { [key: number]: number } }= {}
        for (let i = 0; i < transactions.values.length; i++) {
            let transaction = transactions.values[i]
            let currentMonth = CalendarDate.nowLocal()
            if (transaction.category) {
                let month = new CalendarDate(transaction.transactionDate)
                let offset = undefined;
                if (month.isBefore(currentMonth)) {
                    offset = new CalendarDateRange(month, currentMonth).getDifferenceInMonths()
                } else {
                    offset = new CalendarDateRange(currentMonth, month).getDifferenceInMonths()
                }
                if(offset !== undefined) {
                    if(spent[transaction.category]) {
                        if(spent[transaction.category][offset]) {
                            spent[transaction.category][offset] += transaction.amount
                        } else {
                            spent[transaction.category][offset] = transaction.amount
                        }
                    } else {
                        spent[transaction.category] = { [offset]: transaction.amount }
                    }
                }
            }
        }
        transactions.spent = spent
        })
    })
    return {
        transactions,
        createTransaction: (userId: string, amount: number, category: number, payee: number, transactionDate: string) => {
            replicacheTransactionInstance.mutate.create_transaction({
                id: new Date().getTime(),
                userId,
                amount,
                category,
                payee,
                transactionDate,
                deleted: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            })
        }
    }
}