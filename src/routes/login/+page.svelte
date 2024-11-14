<script lang="ts">
    import { signIn, signOut } from "@auth/sveltekit/client";
    import { page } from "$app/stores";
	import { redirect } from "@sveltejs/kit";
	import { goto, replaceState } from "$app/navigation";
    
    $effect(() => {
        console.log($page.data.session)
        if($page.data.session) {
            goto('/');
        }
    })
</script>

<h1>Welcome to Budget</h1>

{#if !$page.data.session}
    <h1>You are not logged in</h1>
    <button onclick={() => signIn('github')}>Sign in with Github</button>
{/if}

<style>
    h1 {
        color: var(---text);
    }
</style>