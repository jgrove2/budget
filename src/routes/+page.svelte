<script lang="ts">
    import { signIn, signOut } from "@auth/sveltekit/client";
    import { page } from "$app/stores";
	import { redirect } from "@sveltejs/kit";
	import { goto } from "$app/navigation";
    
    $effect(() => {
        if(!$page.data.session) {
            goto('/login');
        }
    })
</script>

<h1>Welcome to Budget</h1>

{#if $page.data.session}
    <h1>You are logged in</h1>
{/if}

<style>
    h1 {
        color: var(---text);
    }
</style>