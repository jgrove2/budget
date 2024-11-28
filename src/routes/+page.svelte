<script lang="ts">
	import { goto } from "$app/navigation";
	import SignedIn from "clerk-sveltekit/client/SignedIn.svelte";
	import SignedOut from "clerk-sveltekit/client/SignedOut.svelte";
    console.log('Hello from budget/src/routes/%2Bpage.svelte');
</script>

<h1>Welcome to Budget</h1>
<SignedOut>
    <button onclick={() => goto('/signin')}>Sign In</button>
    <button onclick={() => goto('/signup')}>Sign Up</button>
</SignedOut>
<SignedIn>
    <button onclick={() => goto('/budget/')}>Go to Budget</button>
</SignedIn>


<style>
    h1 {
        color: var(---text);
    }
</style>