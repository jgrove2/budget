<script lang="ts">
	import { onMount } from 'svelte';
	import SignedIn from 'clerk-sveltekit/client/SignedIn.svelte';

	let { categories, createTransaction, accounts } = $props();
	let transaction_form = { category: undefined, amount: 0, transactionDate: undefined, account: undefined };
	let dialog: HTMLDialogElement | null;

	onMount(() => {
		dialog = document.getElementById('create-transaction-dialog') as HTMLDialogElement;
	});

	function onSubmit(e: SubmitEvent, userId: string | undefined) {
		e.preventDefault();
		createTransaction({
			id: new Date().getTime(),
			userId: userId || '',
			amount: transaction_form.amount,
			category: transaction_form.category,
			account: transaction_form.account,
			transactionDate: transaction_form.transactionDate,
			deleted: false,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		});
	}
</script>

<SignedIn let:user>
	<button class="create-transaction" onclick={() => dialog?.showModal()}><span>+</span></button>
	<dialog id="create-transaction-dialog">
		<h2 class="new-transaction-header">New Transaction</h2>
		<form
			onsubmit={(e) => {
				onSubmit(e, user?.id);
				dialog?.close();
			}}
		>
			<label for="transaction-amount">Amount</label>
			<input
				type="number"
				id="transaction-amount"
				step=".01"
				bind:value={transaction_form.amount}
				required
			/>
			<label for="transaction-date">Date</label>
			<input
				type="date"
				id="transaction-date"
				name="transaction-date"
				required
				bind:value={transaction_form.transactionDate}
			/>
			<label for="transaction-account">Account</label>
			<select
				id="transaction-account"
				name="transaction-account"
				bind:value={transaction_form.account}
				required> 
				{#each accounts as account}
					<option value={account.id}>{account.name}</option>
				{/each}
			</select>
			<label for="transaction-category">Category</label>
			<select
				id="transaction-category"
				name="transaction-category"
				bind:value={transaction_form.category}
				required
			>
				{#each categories as category}
					<option value={category.id}>{category.name}</option>
				{/each}
			</select>
			<button class="submit" type="submit">+ Add Transaction</button>
		</form>
		<button class="close-dialog" onclick={() => dialog?.close()}><span>×</span></button>
	</dialog>
</SignedIn>

<style>
	.new-transaction-header {
		font-size: 2rem;
		text-align: center;
	}
	.close-dialog {
		position: absolute;
		top: 1rem;
		right: 1rem;
		color: var(---text);
		font-size: 2rem;
		width: 1rem;
		cursor: pointer;
		line-height: 1rem;
		display: flex;
		border: none;
		background-color: rgba(0,0,0,0);
		cursor: pointer;
		justify-content: center;
		align-items: center;
		padding: 0;
		span {
			text-align: center;
			width: fit-content;
		}
	}
	.create-transaction {
		position: absolute;
		bottom: 1em;
		margin-left: auto;
		margin-right: auto;
		left: 0;
		right: 0;
		text-align: center;
		display: flex;
		justify-content: center;
		align-items: center;
		width: fit-content;
		height: 2rem;
		width: 2rem;
		padding: 2rem;
		border-radius: 4rem;
		background-color: var(---text);
		color: var(---background);
		font-size: 2em;
		border: none;
		cursor: pointer;
		span {
			width: fit-content;
			height: fit-content;
			line-height: 1rem;
		}
	}
	dialog {
		float: left;
		background-color: var(---background);
		width: 22rem;
		color: var(---text);
		position: absolute;
	}
	dialog::backdrop {
		background: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.7));
		animation: fade-in 1s;
	}
	dialog form {
		margin-left: auto;
		margin-right: auto;
		width: fit-content;
		label {
			display: block;
			font-size: 1rem;
			margin-bottom: 0.25rem;
		}
		input,
		select {
			margin-bottom: 0.5rem;
			width: 20rem;
			display: block;
			height: 2rem;
			font-size: 1rem;
			-ms-box-sizing: content-box;
			-moz-box-sizing: content-box;
			-webkit-box-sizing: content-box;
			box-sizing: border-box;
		}
		input[type='number'] {
			appearance: textfield;
		}
		.submit {
			display: block;
			width: 20rem;
			height: 2.5rem;
			margin-top: 3rem;
			background-color: var(---text);
			color: var(---background);
			border: none;
			font-weight: bold;
			font-size: 1rem;
		}
	}
	@media (min-width: 1000px) {
		dialog {
			float: left;
			background-color: var(---background);
			width: 33rem;
			color: var(---text);
			position: absolute;
		}
		dialog::backdrop {
			background: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.7));
			animation: fade-in 1s;
		}
		.close-dialog {
			position: absolute;
			top: 1rem;
			right: 1rem;
			color: var(---text);
			font-size: 3rem;
			width: fit-content;
			background-color: rgba(0,0,0,0);
			border: none;
			line-height: 1.5rem;
			display: flex;
			cursor: pointer;
			justify-content: center;
			align-items: center;
			padding: 0;
			span {
				text-align: center;
				width: fit-content;
			}
		}
		dialog form {
			margin-left: auto;
			margin-right: auto;
			width: fit-content;
			label {
				display: block;
				font-size: 1rem;
			}
			input,
			select {
				width: 22rem;
				display: block;
				height: 2.5rem;
				font-size: 1rem;
				background-color: white;
				-ms-box-sizing: content-box;
				-moz-box-sizing: content-box;
				-webkit-box-sizing: content-box;
				box-sizing: border-box;
			}
			input[type='number'] {
				appearance: textfield;
			}
			button {
				display: block;
				width: 22rem;
				height: 2.5rem;
				margin-top: 3rem;
				background-color: var(---text);
				color: var(---background);
				border: none;
				font-weight: bold;
				font-size: 1rem;
			}
		}
	}
	@keyframes fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>
