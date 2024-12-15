import { Replicache, type WriteTransaction } from "replicache";
import { PUBLIC_REP_LICENSE } from '$env/static/public';
import { dev } from "$app/environment";
import type { Payee } from "$lib/types/Payee";
const licenseKey = PUBLIC_REP_LICENSE;

export function usePayees() {
    let payees: { values: Payee[] } = $state({ values: [] });
    let replicachePayeeInstance: Replicache<any> = $state(new Replicache({
        name: dev ? "dev:payees" : "payees",
        licenseKey,
        mutators: {
            create_payee: async (tx: WriteTransaction, args: Payee) => {
                const key = `payees/${args.id}`;
                await tx.set(key, args);
            },
            delete_payee: async (tx: WriteTransaction, args: Payee) => {
                const key = `payees/${args.id}`;
                await tx.set(key, args);
            }
        }
    }));
    $effect.root(() => {
        $effect(() => {
            return replicachePayeeInstance.subscribe(
                async (tx) => {
                    const payeeItems = await tx.scan({ prefix: 'payees/' }).entries().toArray();
                    return payeeItems
                        .map(([_, value]) => value as Payee)
                        .filter((payee) => !payee.deleted);
                },
                (items: Payee[]) => {
                    payees.values = items;
                }
            );
        });
    })
    return {
        payees,
        createPayee: (userId: string, name: string) => {
            replicachePayeeInstance.mutate.create_payee({
                id: new Date().getTime(),
                userId: userId || '',
                name: name,
                deleted: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            })
        }
    }
} 