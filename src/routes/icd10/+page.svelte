<script lang="ts">
	import type { PageData } from './$types';
	import ICD10Selector from '$lib/components/ICD10Selector.svelte';
	
	let { data }: { data: PageData } = $props();
	
	let selectedCode = $state('');
	let selectedDescription = $state('');
	let searchQuery = $state('');
	let selectedCategory = $state('all');

	const categoryLabels: Record<string, string> = {
		M: 'Muskuloskeletal',
		S: 'Cedera/Injury',
		G: 'Sistem Saraf',
		I: 'Sirkulasi',
		J: 'Respirasi',
		R: 'Gejala',
		Z: 'Faktor Kesehatan',
		OTHER: 'Lainnya'
	};

	const categoryColors: Record<string, string> = {
		M: 'bg-blue-100 text-blue-800',
		S: 'bg-red-100 text-red-800',
		G: 'bg-purple-100 text-purple-800',
		I: 'bg-pink-100 text-pink-800',
		J: 'bg-cyan-100 text-cyan-800',
		R: 'bg-orange-100 text-orange-800',
		Z: 'bg-green-100 text-green-800',
		OTHER: 'bg-gray-100 text-gray-800'
	};

	let filteredCodes = $derived.by(() => {
		let result = data.codes;
		
		if (selectedCategory !== 'all') {
			result = result.filter(c => c.category === selectedCategory);
		}
		
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			result = result.filter(c => 
				c.code.toLowerCase().includes(query) ||
				c.description.toLowerCase().includes(query) ||
				(c.descriptionId && c.descriptionId.toLowerCase().includes(query))
			);
		}
		
		return result;
	});
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<div>
			<h1 class="text-2xl font-bold text-gray-800">🏥 Kode ICD-10</h1>
			<p class="text-gray-600">Database diagnosis standar internasional untuk fisioterapi</p>
		</div>
	</div>

	<!-- Stats -->
	<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
		<div class="bg-white rounded-xl shadow-sm border p-4">
			<div class="text-3xl font-bold text-teal-600">{data.totalCodes}</div>
			<div class="text-sm text-gray-600">Total Kode</div>
		</div>
		<div class="bg-white rounded-xl shadow-sm border p-4">
			<div class="text-3xl font-bold text-orange-500">{data.commonCount}</div>
			<div class="text-sm text-gray-600">Kode Umum ★</div>
		</div>
		{#each data.categoryStats.slice(0, 2) as stat}
			<div class="bg-white rounded-xl shadow-sm border p-4">
				<div class="text-3xl font-bold text-gray-700">{stat.count}</div>
				<div class="text-sm text-gray-600">{categoryLabels[stat.category] || stat.category}</div>
			</div>
		{/each}
	</div>

	<!-- Test Selector -->
	<div class="bg-white rounded-xl shadow-sm border p-6">
		<h2 class="text-lg font-semibold text-gray-800 mb-4">🔍 Test ICD-10 Selector</h2>
		<div class="max-w-md">
			<ICD10Selector 
				codes={data.codes} 
				bind:selectedCode 
				bind:selectedDescription 
			/>
		</div>
		{#if selectedCode}
			<div class="mt-4 p-3 bg-teal-50 rounded-lg">
				<span class="font-medium">Dipilih:</span> 
				<span class="font-mono text-teal-700">{selectedCode}</span> - {selectedDescription}
			</div>
		{/if}
	</div>

	<!-- Search & Filter -->
	<div class="bg-white rounded-xl shadow-sm border p-4">
		<div class="flex flex-col md:flex-row gap-4">
			<div class="flex-1">
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Cari kode atau deskripsi..."
					class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
				/>
			</div>
			<div class="flex gap-2 flex-wrap">
				<button
					class="px-3 py-2 rounded-lg text-sm {selectedCategory === 'all' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
					onclick={() => selectedCategory = 'all'}
				>
					Semua
				</button>
				{#each data.categoryStats as stat}
					<button
						class="px-3 py-2 rounded-lg text-sm {selectedCategory === stat.category ? 'bg-teal-600 text-white' : categoryColors[stat.category]}"
						onclick={() => selectedCategory = stat.category}
					>
						{stat.category} ({stat.count})
					</button>
				{/each}
			</div>
		</div>
	</div>

	<!-- Code List -->
	<div class="bg-white rounded-xl shadow-sm border overflow-hidden">
		<div class="p-4 border-b bg-gray-50">
			<h2 class="font-semibold text-gray-800">Daftar Kode ({filteredCodes.length})</h2>
		</div>
		<div class="divide-y max-h-[600px] overflow-y-auto">
			{#each filteredCodes as code}
				<div class="p-4 hover:bg-gray-50">
					<div class="flex items-start gap-3">
						<div class="flex-shrink-0">
							<span class="px-2 py-1 text-sm font-mono font-bold rounded {categoryColors[code.category]}">
								{code.code}
							</span>
						</div>
						<div class="flex-1">
							<div class="flex items-center gap-2">
								<span class="font-medium text-gray-800">
									{code.descriptionId || code.description}
								</span>
								{#if code.isCommon}
									<span class="text-orange-500" title="Umum digunakan">★</span>
								{/if}
							</div>
							{#if code.descriptionId}
								<div class="text-sm text-gray-500">{code.description}</div>
							{/if}
							{#if code.subcategory}
								<div class="text-xs text-gray-400 mt-1">{code.subcategory}</div>
							{/if}
						</div>
					</div>
				</div>
			{:else}
				<div class="p-8 text-center text-gray-500">
					Tidak ada kode ditemukan
				</div>
			{/each}
		</div>
	</div>
</div>
