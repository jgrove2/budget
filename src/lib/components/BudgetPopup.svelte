<script lang="ts">
	import { formatMoney } from '$lib/clientHelpers/formatMoney';
	import { onMount } from 'svelte';

	let { setBudget, currentBudget} = $props();
    let updateCalculation = $state(false);
	let budget_form = $state({
		budget: currentBudget
	});
	let dialog: HTMLDialogElement | null;
	onMount(() => {
		dialog = document.getElementById('budget-dialog') as HTMLDialogElement;
	});

	function onSubmit(e: SubmitEvent) {
		e.preventDefault();
        setBudget(budget_form.budget)
		budget_form.budget = currentBudget;
        dialog?.close();
        updateCalculation = !updateCalculation;
	}
	function showModal() {
		budget_form.budget = currentBudget;
		dialog?.showModal();
	}
</script>
    <button onclick={showModal}>{formatMoney(currentBudget)}</button>
	<dialog id="budget-dialog">
		<h2 class="new-budget-header">New Budget</h2>
		<form
			onsubmit={(e) => {
				onSubmit(e);
			}}
		>
			<label for="budget-amount">Budget</label>
			<div class="budget-amount-input">
				<input
				type="number"
				id="transaction-amount"
				step=".01"
				bind:value={budget_form.budget}
				required
				/>
			</div>
			<button class="submit" type="submit">Update Budget</button>
		</form>
		<button class="close-dialog" onclick={() => dialog?.close()}><span>×</span></button>
	</dialog>

<style>
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
			input[type='number']{
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
