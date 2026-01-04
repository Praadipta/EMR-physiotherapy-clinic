<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();

	let selectedTemplate = $state<typeof data.templates[0] | null>(null);
	let selectedCategory = $state<string | null>(null);

	const categoryLabels: Record<string, { label: string; icon: string }> = {
		musculoskeletal: { label: 'Muskuloskeletal', icon: '🦴' },
		neurological: { label: 'Neurologis', icon: '🧠' },
		cardiopulmonary: { label: 'Kardiopulmoner', icon: '❤️' },
		pediatric: { label: 'Pediatrik', icon: '👶' },
		geriatric: { label: 'Geriatrik', icon: '👴' },
		sports: { label: 'Olahraga', icon: '⚽' },
		post_surgical: { label: 'Pasca Operasi', icon: '🏥' },
		other: { label: 'Lainnya', icon: '📋' }
	};

	const filteredTemplates = $derived(() => {
		if (!selectedCategory) return data.templates;
		return data.templates.filter(t => t.category === selectedCategory);
	});
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-2xl font-bold text-gray-800">📝 Template Klinis</h1>
		<p class="text-gray-600">Template dokumentasi SOAP untuk kondisi umum</p>
	</div>

	<!-- Category Filter -->
	<div class="flex gap-2 flex-wrap">
		<button
			onclick={() => selectedCategory = null}
			class="px-3 py-2 rounded-lg text-sm font-medium transition-colors
				{selectedCategory === null ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
		>
			Semua
		</button>
		{#each Object.entries(categoryLabels) as [key, val]}
			{#if data.categories[key]}
				<button
					onclick={() => selectedCategory = key}
					class="px-3 py-2 rounded-lg text-sm font-medium transition-colors
						{selectedCategory === key ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
				>
					{val.icon} {val.label} ({data.categories[key].length})
				</button>
			{/if}
		{/each}
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<!-- Template List -->
		<div class="lg:col-span-2 space-y-4">
			{#if filteredTemplates().length === 0}
				<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
					<p class="text-gray-500">Tidak ada template yang ditemukan</p>
				</div>
			{:else}
				{#each filteredTemplates() as template}
					<button
						onclick={() => selectedTemplate = template}
						class="w-full text-left bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow
							{selectedTemplate?.id === template.id ? 'ring-2 ring-teal-500' : ''}"
					>
						<div class="flex items-start gap-4">
							<div class="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
								{categoryLabels[template.category]?.icon || '📋'}
							</div>
							<div class="flex-1">
								<h3 class="font-semibold text-gray-800">{template.name}</h3>
								<p class="text-sm text-gray-500">{template.condition}</p>
								<div class="flex gap-2 mt-2">
									<span class="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
										{categoryLabels[template.category]?.label}
									</span>
									{#if template.expectedDuration}
										<span class="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">
											⏱️ {template.expectedDuration}
										</span>
									{/if}
									{#if template.expectedSessions}
										<span class="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700">
											📅 {template.expectedSessions} sesi
										</span>
									{/if}
								</div>
							</div>
						</div>
					</button>
				{/each}
			{/if}
		</div>

		<!-- Template Detail Panel -->
		<div class="lg:col-span-1">
			{#if selectedTemplate}
				<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6 space-y-4">
					<div class="flex items-center gap-3">
						<div class="w-14 h-14 bg-teal-100 rounded-lg flex items-center justify-center text-3xl">
							{categoryLabels[selectedTemplate.category]?.icon || '📋'}
						</div>
						<div>
							<h2 class="text-lg font-bold text-gray-800">{selectedTemplate.name}</h2>
							<p class="text-sm text-gray-500">{selectedTemplate.condition}</p>
						</div>
					</div>

					<div class="flex gap-2 flex-wrap">
						{#if selectedTemplate.expectedDuration}
							<span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
								⏱️ {selectedTemplate.expectedDuration}
							</span>
						{/if}
						{#if selectedTemplate.expectedSessions}
							<span class="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700">
								📅 {selectedTemplate.expectedSessions} sesi
							</span>
						{/if}
					</div>

					<!-- SOAP Sections -->
					{#if selectedTemplate.subjective}
						<div class="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
							<h4 class="font-medium text-blue-800 text-sm mb-1">S - Subjektif</h4>
							<p class="text-sm text-blue-900 whitespace-pre-line">{selectedTemplate.subjective}</p>
						</div>
					{/if}

					{#if selectedTemplate.objective}
						<div class="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
							<h4 class="font-medium text-green-800 text-sm mb-1">O - Objektif</h4>
							<p class="text-sm text-green-900 whitespace-pre-line">{selectedTemplate.objective}</p>
						</div>
					{/if}

					{#if selectedTemplate.assessment}
						<div class="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
							<h4 class="font-medium text-yellow-800 text-sm mb-1">A - Asesmen</h4>
							<p class="text-sm text-yellow-900 whitespace-pre-line">{selectedTemplate.assessment}</p>
						</div>
					{/if}

					{#if selectedTemplate.plan}
						<div class="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400">
							<h4 class="font-medium text-purple-800 text-sm mb-1">P - Rencana</h4>
							<p class="text-sm text-purple-900 whitespace-pre-line">{selectedTemplate.plan}</p>
						</div>
					{/if}

					<button class="w-full px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors">
						🩺 Gunakan Template
					</button>
				</div>
			{:else}
				<div class="bg-gray-50 rounded-xl p-8 text-center">
					<span class="text-4xl">📝</span>
					<p class="text-gray-500 mt-2">Pilih template untuk melihat detail</p>
				</div>
			{/if}
		</div>
	</div>
</div>
