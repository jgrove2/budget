<script lang="ts">
	import SignUp from "clerk-sveltekit/client/SignUp.svelte";
</script>

<div class="container">
	<SignUp afterSignUpUrl="/budget/"/>
</div>

<style>
	.container {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
	}
</style>
