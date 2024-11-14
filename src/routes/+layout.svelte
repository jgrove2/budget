<script lang="ts">
	import { goto } from '$app/navigation';
	import { slide } from 'svelte/transition';
	import { page } from '$app/stores';
	import { signOut } from '@auth/sveltekit/client';
	import AnimatedHamburger from '$lib/AnimatedHamburger.svelte';
	import Folderopen from '$lib/svg/FolderOpen.svelte';
	import Calculator from '$lib/svg/Calculator.svelte';
	import type { DOM } from '@fortawesome/fontawesome-svg-core';
	import { onMount } from 'svelte';
    let { children } = $props();
	const loginState = $derived($page.data.session ? true : false);
	let open = $state(false);
    let innerWidth = $state(0);
    let innerHeight = $state(0);
    let userPopupMenuOpen = $state(false);
    let button: HTMLButtonElement | undefined = $state(undefined);
    let popupPosition = $state({top: 0, left: 0});

    const togglePopup = (event) => {
        if(button) {
            const buttonRect = button?.getBoundingClientRect();
            popupPosition = {
                top: buttonRect.top + window.scrollY - 25,
                left: buttonRect.left + window.scrollX
            }
            userPopupMenuOpen = !userPopupMenuOpen;
        }
    }
    const closePopup = (event) => {
        if(button && !button.contains(event.target) ) {
            userPopupMenuOpen = false;
        }
    }
    onMount(() => {
        document.addEventListener("click", closePopup)
    })
    $effect(() => {
        if(!open) {
            userPopupMenuOpen = false;
        }
    })
</script>
<svelte:window bind:innerHeight bind:innerWidth></svelte:window>
<div class="surrounding">
	<div class="menu" onmouseenter={() => open = true} onmouseleave={() => open = false} onfocus={() =>{}} onblur={() => {}} role="banner">
		<div class="center">
            {#if !open && innerWidth <= 1200}
                <a href="/" class="logo"><Calculator /></a>
                {:else}
                <a href="/" class="logo"><Calculator/> <span>Budget</span></a>
                {/if}
                </div>
        <div class="links">
            {#if (open && innerWidth <= 1200) || innerWidth >= 1200}
            <div class="center nav_link"><a href="/accounts" ><Folderopen /><span>Accounts</span></a></div>
            {:else}
            <div class="center nav_link"><a href="/accounts" ><Folderopen /></a></div>
            {/if}
        </div>
		{#if $page.data.session}
			<button class="user_profile" bind:this={button} onclick={togglePopup}>
				{#if $page.data.session?.user?.image}
					<img src={$page.data.session.user.image} alt="User Profile" />
				{/if}
                {#if (open && innerWidth <= 1200) || (innerWidth >= 1200)}
				<div class="user_name">
					<div>{$page.data.session.user?.name}</div>
				</div>
                {/if}
			</button>
		{/if}
        <div class="user_menu {userPopupMenuOpen ? "user_menu" : "hidden_user_menu"}" style="top: {popupPosition.top}px; left: {popupPosition.left}px;">
            <button onclick={() => signOut()}>Signout</button>
        </div>
        </div>
	<section class="body_section">
		{@render children()}
	</section>
</div>

<style>
    .user_menu {
        background-color: var(---text);
        position:absolute;
        color: var(---background);
        width: 12em;
        padding: .5em;
        border-radius: 25px;
    }
    .hidden_user_menu {
        display:none;
        position: absolute;
    }
	.user_profile .user_name {
        color: var(---text);
		font-weight: bold;
	}
    .links {
        display: flex;
        justify-content: center;
        padding-top: 2em;
        border-bottom: 2px solid var(---text);
    }
    .links a {
        text-decoration: none;
        font-weight: bold;
        color: var(---text);
        padding: .25em;
        border-radius: 5px;
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 1.25rem;
        
    }
    .links .nav_link {
        height: fit-content;
    }
	.user_profile {
        background-color: transparent;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
		padding-top: 2em;
        gap: 1em;
	}
	.user_profile img {
		width: 3em;
		height: 3em;
		border: 4px solid var(---text);
		border-radius: 50px;
	}
	.user_profile div {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
	}
	.center {
		display: flex;
		justify-content: center;
        align-items: center;
	}
	.menu {
        width: 4rem;
		height: 80svh;
        position: -webkit-sticky;
        top: 0;
		padding: 1em;
        margin: 1em;
		border: 2px solid var(---text);
        border-radius: 20px;
        display: grid;
        grid-template-columns: auto;
        grid-template-rows: 15% 70% 15%;
        position:sticky;

	}
    .menu:hover {
        width: auto;
    }
    .menu:hover .logo{
        justify-content: center;
    }
	.surrounding {
		display: flex;
	}
	.logo {
		font-size: 3rem;
		color: var(---text);
        display: flex;
		font-weight: bolder;
		text-decoration: none;
		width: 100%;
        gap: 5px;
        align-items: center;
        justify-content: center;
		padding-bottom: 0.5em;
		border-bottom: 2px solid var(---text);
	}
    @media (min-width: 1200px) {
        .menu {
            width: auto;
        }
    }
</style>
