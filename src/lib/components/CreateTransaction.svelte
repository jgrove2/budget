<script lang="ts">
	import { onMount } from 'svelte';
	import SignedIn from 'clerk-sveltekit/client/SignedIn.svelte';

	let { categories, createTransaction, payees } = $props();
	let transaction_form = $state({
		transactionType: 1,
		category: undefined,
		amount: 0,
		transactionDate: undefined,
		payee: undefined
	});
	let dialog: HTMLDialogElement | null;
	let selected_positive = $derived(transaction_form.transactionType === 1);
	let selected_negative = $derived(transaction_form.transactionType === -1);
	onMount(() => {
		dialog = document.getElementById('create-transaction-dialog') as HTMLDialogElement;
	});

	let categoriesPlusDefaults = $derived([...categories, {id: -2, name: 'Income'}]);

	function onSubmit(e: SubmitEvent, userId: string | undefined) {
		e.preventDefault();
		createTransaction({
			id: new Date().getTime(),
			userId: userId || '',
			amount: transaction_form.amount * transaction_form.transactionType,
			category: transaction_form.category,
			payee: transaction_form.payee,
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
			<div class="transaction-amount-input">
				<ul>
					<li class="radio-li" class:selected_positive>
						<input
						type="radio"
						id="transaction-type-income"
						name="transaction-type"
						value={1}
						bind:group={transaction_form.transactionType}
						/>
						<label for="transaction-type-income">+</label>
					</li>
					<li class:selected_negative>
					<input
						type="radio"
						id="transaction-type-expense"
						name="transaction-type"
						value={-1}
						bind:group={transaction_form.transactionType}
						/>
						<label for="transaction-type-expense">-</label>
					</li>
				</ul>
				<input
				type="number"
				id="transaction-amount"
				step=".01"
				bind:value={transaction_form.amount}
				required
				/>
			</div>
			<label for="transaction-date">Date</label>
			<input
				type="date"
				id="transaction-date"
				name="transaction-date"
				required
				bind:value={transaction_form.transactionDate}
			/>
			<label for="transaction-payee">Payee</label>
			<select
				id="transaction-payee"
				name="transaction-payee"
				bind:value={transaction_form.payee}
				required
			>
				{#each payees as payee}
					<option value={payee.id}>{payee.name}</option>
				{/each}
			</select>
			<label for="transaction-category">Category</label>
			<select
				id="transaction-category"
				name="transaction-category"
				bind:value={transaction_form.category}
				required
			>
				{#each categoriesPlusDefaults as category}
					<option value={category.id}>{category.name}</option>
				{/each}
			</select>
			<button class="submit" type="submit">+ Add Transaction</button>
		</form>
		<button class="close-dialog" onclick={() => dialog?.close()}><span>×</span></button>
	</dialog>
</SignedIn>

<style>
	.transaction-amount-input {
		display: flex;
		/* gap: 0.5rem; */
		input[type=number] {
			width: 66% !important;
		}
	}
	ul {
		width: 33%;
		margin: 0;
		padding:0;
	}
	li {
		color: var(---text);
		background-color: var(---background);
		list-style-type: none;
		float: left;
		width: 3rem;
		border: 2px solid var(---text);
		cursor: pointer;
		label {
			cursor: pointer;
			font-weight: bolder;
			font-size: 1rem !important;
			text-align: center;
		}
	}
	li.selected_positive {
		background-color: var(---text);
		color: var(---background);
	}
	li.selected_negative {
		background-color: var(---text);
		color: var(---background);
	}
	input[type='radio'] {
		display: none;
	}
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
		background-color: rgba(0, 0, 0, 0);
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
		input[type='number'],
		input[type='date'],
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
			background-color: white;
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
	.transaction-amount-input {
		display: flex;
		/* gap: 0.5rem; */
		input[type=number] {
			width: 70% !important;
		}
	}
		ul {
			width: 33%;
		}
		li {
			color: var(---text);
			background-color: var(---background);
			list-style-type: none;
			float: left;
			width: 3rem;
			border: 2px solid var(---text);
			cursor: pointer;
			label {
				cursor: pointer;
				font-weight: bolder;
				font-size: 1.5rem !important;
				text-align: center;
				margin-bottom: 2px !important;
			}
		}
		li.selected_positive {
			background-color: var(---text);
			color: var(---background);
		}
		li.selected_negative {
			background-color: var(---text);
			color: var(---background);
		}
		input[type='radio'] {
			display: none;
			cursor: pointer;
		}
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
			background-color: rgba(0, 0, 0, 0);
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
			input[type='date'],
			input[type='number'],
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
