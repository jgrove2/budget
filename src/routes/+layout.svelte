<script lang="ts">
	import { page } from '$app/stores';
	import Folderopen from '$lib/svg/FolderOpen.svelte';
	import Calculator from '$lib/svg/Calculator.svelte';
	import PopupMenu from '$lib/components/PopupMenu.svelte';
	import House from '$lib/svg/House.svelte';
	import SignedIn from 'clerk-sveltekit/client/SignedIn.svelte';
	import SignedOut from 'clerk-sveltekit/client/SignedOut.svelte';
	import UserProfile from 'clerk-sveltekit/client/UserProfile.svelte';
	import UserButton from 'clerk-sveltekit/client/UserButton.svelte';
	let { children } = $props();
	let open = $state(false);
	let innerWidth = $state(0);
	let innerHeight = $state(0);
	let showMenu = $state(false);
	let popupPosition = $state({ x: 0, y: 0 });
	let browser = $state({ h: 0, w: 0 });
	let menu = $state({ h: 0, w: 0 });
	export function rightClickContextMenu(event: any) {
		showMenu = true;
		browser = {
			w: window.innerWidth,
			h: window.innerHeight
		};
		popupPosition = {
			x: event.clientX,
			y: event.clientY
		};
		// If bottom part of context menu will be displayed
		// after right-click, then change the position of the
		// context menu. This position is controlled by `top` and `left`
		// at inline style.
		// Instead of context menu is displayed from top left of cursor position
		// when right-click occur, it will be displayed from bottom left.
		if (browser.h - popupPosition.y < menu.h) popupPosition.x = popupPosition.y - menu.h;
		if (browser.w - popupPosition.x < menu.w) popupPosition.x = popupPosition.x - menu.w;
	}
</script>

<svelte:window bind:innerHeight bind:innerWidth />
<div class="surrounding">
	<SignedIn let:user>
		<div
			class="menu"
			onmouseenter={() => (open = true)}
			onmouseleave={() => (open = false)}
			onfocus={() => {}}
			onblur={() => {}}
			role="banner"
		>
			<div class="center">
				{#if (!open && innerWidth <= 1200) || innerWidth <= 1000}
					<a href="/budget/" class="logo"><Calculator /></a>
				{:else}
					<a href="/budget/" class="logo"><Calculator /> <span>Budget</span></a>
				{/if}
			</div>
			<div class="links">
				{#if (!open && innerWidth <= 1200) || innerWidth <= 1000}
					<div class="center nav_link"><a href="/budget/accounts"><Folderopen /></a></div>
				{:else}
					<div class="center nav_link">
						<a href="/budget/accounts"><Folderopen /><span>Accounts</span></a>
					</div>
				{/if}
				<br />
				{#if (!open && innerWidth <= 1200) || innerWidth <= 1000}
					<div class="center nav_link"><a href="/budget/"><House /></a></div>
				{:else}
					<div class="center nav_link"><a href="/budget/"><House /><span>Budget</span></a></div>
				{/if}
			</div>
			<SignedIn>
				<div class="user_profile">
					{#if (!open && innerWidth <= 1200) || innerWidth <= 1000}
						<UserButton afterSignOutUrl="/" />
					{:else}
						<UserButton afterSignOutUrl="/" />
						{user?.username}
					{/if}
				</div>
			</SignedIn>
		</div>
	</SignedIn>
	<section class="body_section">
		<SignedIn let:user>
			{@render children()}
		</SignedIn>
		<SignedOut>
			{@render children()}
		</SignedOut>
	</section>
</div>

<style>
	.links {
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding-top: 1em;
		gap: 1em;
		border-bottom: 2px solid var(---text);
		justify-content: flex-start;
	}
	.links a {
		text-decoration: none;
		font-weight: bold;
		color: var(---text);
		padding: 0.25em;
		border-radius: 5px;
		display: flex;
		align-items: center;
		gap: 0.5em;
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
	.center {
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.menu {
		width: 4rem;
		position: -webkit-sticky;
		top: 0;
		padding: 1em;
		margin: 1em;
		border: 4px solid var(---text);
		border-radius: 20px;
		display: grid;
		grid-template-columns: auto;
		grid-template-rows: 15% 70% 15%;
		position: sticky;
	}
	.menu:hover {
		width: auto;
	}
	.menu:hover .logo {
		justify-content: center;
	}
	.surrounding {
		display: flex;
		height: 100vh;
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
	@media (max-width: 1000px) {
		.logo {
			border-bottom: none;
			display: flex;
			align-items: center;
			padding-bottom: 0;
		}
		.menu {
			height: 4em;
			width: auto;
			grid-template-columns: 15% 65% 20%;
			grid-template-rows: auto;
		}
		.user_profile {
			padding-top: 0;
			align-items: center;
		}
		.links {
			border-right: 2px solid var(---text);
			border-left: 2px solid var(---text);
			border-bottom: none;
			padding-top: 0;
			display: flex;
			align-items: center;
			flex-direction: row;
			justify-content: flex-start;
			gap: 1em;
			padding-left: 1em;
		}
		.surrounding {
			flex-direction: column;
		}
	}
	@media (min-width: 1200px) {
		.menu {
			width: auto;
		}
	}
</style>
