<script>
    import RedirectToSignIn from "$lib/components/RedirectToSignIn.svelte";
	import SignedOut from "clerk-sveltekit/client/SignedOut.svelte";

    const {children} = $props();
</script>

<SignedOut>
    <RedirectToSignIn />
</SignedOut>
{@render children()}