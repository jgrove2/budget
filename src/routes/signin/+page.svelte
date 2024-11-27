<script lang="ts">
	import SignIn from "clerk-sveltekit/client/SignIn.svelte";
</script>

<div class="container">
	<SignIn afterSignUpUrl="/budget/"/>
</div>

<style>
	.container {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
	}
</style>
