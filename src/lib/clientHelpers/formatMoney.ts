export function formatMoney(amount: number): string {
    return (Math.floor(amount * 100) / 100).toLocaleString('en-US', {style: 'currency', currency: 'USD'});
}