<!-- 
Github @dukenmarga, July 2022
Context Menu is small menu that displayed when user right-click the mouse on browser.
Think of it as a way to show Refresh option on Microsoft Windows when right-click on desktop.
Known bug:
    - If the browser loads the content for the first time, showMenu set to false.
    Hence, we cannot get menu.h and menu.y dimension, since context menu has not been available at DOM.
    The first right click will not shown properly when right-click occurs around the edge (bottom part
    and right part) of the browser.

Inspired from: Context Menu https://svelte.dev/repl/3a33725c3adb4f57b46b597f9dade0c1?version=3.25.0
-->

<script lang="ts">
	// import { signOut } from '@auth/sveltekit/client';
	let {
		browser,
		menu,
		pos,
		showMenu,
		hideMenu
	}: {
		browser: { w: number; h: number };
		menu: { h: number; w: number };
		pos: { y: number; x: number };
		showMenu: boolean;
		hideMenu: () => void;
	} = $props();

	let mounted = $state(false);

	// pos is cursor position when right click occur
	let content;

	export function clickContextMenu(e: any) {
		showMenu = true;
		browser = {
			w: window.innerWidth,
			h: window.innerHeight
		};
		pos = {
			x: e.clientX - menu.w/2,
			y: e.clientY
		};
		if (browser.h - pos.y < menu.h) pos.y = pos.y - menu.h;
		if (browser.w - pos.x < menu.w) pos.x = pos.x - menu.w;
	}
	export function onPageClick(e: any) {
		if(!mounted) {
			clickContextMenu(e)
			mounted = true;
		} else {
			mounted = false;
			hideMenu();
		}
	}
	function getContextMenuDimension(node: any) {
		// This function will get context menu dimension
		// when navigation is shown => showMenu = true
		let height = node.offsetHeight;
		let width = node.offsetWidth;
		menu = {
			h: height,
			w: width
		};
	}

	let menuItems = [
		{
			name: 'signOut',
			onClick: () => {},
			displayText: 'Sign Out',
			class: ''
		}
	];

</script>

<svelte:head>
	<!-- You can change icon sets according to your taste. Change `class` value in `menuItems` above to represent your icons. -->
	<!-- <link rel="stylesheet" href="/icon/css/mfglabs_iconset.css"> -->
	<link
		rel="stylesheet"
		href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css"
		integrity="sha512-KfkfwYDsLkIlwQp6LFnl8zNdLGxu9YAA1QvwINks4PhcElQSvqcyVLLD9aMhXd13uQjoXtEKNosOWaZqXgel0g=="
		crossorigin="anonymous"
		referrerpolicy="no-referrer"
	/>
</svelte:head>

<svelte:window onclick={onPageClick}></svelte:window>
<nav use:getContextMenuDimension style="position: absolute; top:{pos.y}px; left:{pos.x}px">
	<div class="navbar" id="navbar">
		<ul>
			{#each menuItems as item}
				{#if item.name == 'hr'}
					<hr />
				{:else}
					<li>
						<button
							onclick={async () => {
								item.onClick();
								hideMenu();
							}}><i class={item.class}></i>{item.displayText}</button
						>
					</li>
				{/if}
			{/each}
		</ul>
	</div>
</nav>

<style>
	* {
		padding: 0;
		margin: 0;
	}
	.navbar {
		display: inline-flex;
		border: 1px #999 solid;
		width: 170px;
		background-color: #fff;
		border-radius: 10px;
		overflow: hidden;
		flex-direction: column;
	}
	.navbar ul {
		margin: 6px;
	}
	ul li {
		display: block;
		list-style-type: none;
		width: 1fr;
	}
	ul li button {
		font-size: 1rem;
		color: #222;
		width: 100%;
		height: 30px;
		text-align: left;
		border: 0px;
		background-color: #fff;
	}
	ul li button:hover {
		color: #000;
		text-align: left;
		border-radius: 5px;
		background-color: #eee;
	}
	ul li button i {
		padding: 0px 15px 0px 10px;
	}
	ul li button i.fa-square {
		color: #fff;
	}
	ul li button:hover > i.fa-square {
		color: #eee;
	}
	ul li button:hover > i.warning {
		color: crimson;
	}
	:global(ul li button.info:hover) {
		color: navy;
	}
	hr {
		border: none;
		border-bottom: 1px solid #ccc;
		margin: 5px 0px;
	}
</style>
