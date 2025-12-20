<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';

	let { children, data } = $props();

	// Base navigation items for all users
	const baseNavItems = [
		{ href: '/', label: 'Dashboard', icon: '🏠' },
		{ href: '/patients', label: 'Pasien', icon: '👥' },
		{ href: '/appointments', label: 'Jadwal', icon: '📅' },
		{ href: '/clinical', label: 'Klinis', icon: '📋' },
		{ href: '/treatments', label: 'Perawatan', icon: '💊' },
		{ href: '/billing', label: 'Billing', icon: '💰' },
		{ href: '/reports', label: 'Laporan', icon: '📊' }
	];

	// Admin-only navigation items
	const adminNavItems = [{ href: '/staff', label: 'Staf', icon: '👤' }];

	// Compute navigation items based on user role
	const navItems = $derived(
		data.user?.role === 'admin' ? [...baseNavItems, ...adminNavItems] : baseNavItems
	);

	let sidebarOpen = $state(true);
</script>

<svelte:head>
	<title>Klinik Fisioterapi Sambung Nyowo</title>
</svelte:head>

{#if data.user}
	<div class="min-h-screen bg-gray-100">
		<!-- Sidebar -->
		<aside
			class="fixed inset-y-0 left-0 z-50 w-64 bg-teal-700 text-white transform transition-transform duration-200 ease-in-out {sidebarOpen
				? 'translate-x-0'
				: '-translate-x-full'} lg:translate-x-0"
		>
			<div class="p-4 border-b border-teal-600">
				<h1 class="text-xl font-bold">🏥 Sambung Nyowo</h1>
				<p class="text-sm text-teal-200">Klinik Fisioterapi</p>
			</div>

			<nav class="p-4">
				<ul class="space-y-2">
					{#each navItems as item}
						<li>
							<a
								href={item.href}
								class="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors {$page.url
									.pathname === item.href ||
								($page.url.pathname.startsWith(item.href) && item.href !== '/')
									? 'bg-teal-600 text-white'
									: 'hover:bg-teal-600/50'}"
							>
								<span>{item.icon}</span>
								<span>{item.label}</span>
							</a>
						</li>
					{/each}
				</ul>
			</nav>

			<div class="absolute bottom-0 left-0 right-0 p-4 border-t border-teal-600">
				<div class="flex items-center gap-3 mb-3">
					<div
						class="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-lg font-bold"
					>
						{data.user.namaLengkap.charAt(0).toUpperCase()}
					</div>
					<div>
						<p class="font-medium text-sm">{data.user.namaLengkap}</p>
						<p class="text-xs text-teal-200 capitalize">{data.user.role}</p>
					</div>
				</div>
				<form action="/auth/logout" method="POST">
					<button
						type="submit"
						class="w-full px-4 py-2 text-sm bg-teal-600 hover:bg-teal-500 rounded-lg transition-colors"
					>
						Keluar
					</button>
				</form>
			</div>
		</aside>

		<!-- Main Content -->
		<div class="lg:ml-64">
			<!-- Top Bar -->
			<header class="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center gap-4">
				<button 
					class="lg:hidden text-gray-600" 
					onclick={() => (sidebarOpen = !sidebarOpen)}
					aria-label="Toggle menu"
				>
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h16M4 18h16"
						/>
					</svg>
				</button>
				<div class="flex-1">
					<p class="text-sm text-gray-500">
						{new Date().toLocaleDateString('id-ID', {
							weekday: 'long',
							year: 'numeric',
							month: 'long',
							day: 'numeric'
						})}
					</p>
				</div>
			</header>

			<!-- Page Content -->
			<main class="p-6">
				{@render children()}
			</main>
		</div>

		<!-- Mobile Overlay -->
		{#if sidebarOpen}
			<button
				class="lg:hidden fixed inset-0 bg-black/50 z-40"
				onclick={() => (sidebarOpen = false)}
				aria-label="Close menu"
			></button>
		{/if}
	</div>
{:else}
	{@render children()}
{/if}
