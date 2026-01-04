<script lang="ts">
	import { onMount } from 'svelte';

	interface ICD10Code {
		id: number;
		code: string;
		description: string;
		descriptionId: string | null;
		category: string;
		subcategory: string | null;
		isCommon: boolean;
	}

	interface Props {
		codes: ICD10Code[];
		selectedCode?: string;
		selectedDescription?: string;
		name?: string;
		required?: boolean;
		placeholder?: string;
		showIndonesian?: boolean;
	}

	let {
		codes = [],
		selectedCode = $bindable(''),
		selectedDescription = $bindable(''),
		name = 'icd10Code',
		required = false,
		placeholder = 'Cari kode ICD-10...',
		showIndonesian = true
	}: Props = $props();

	let searchQuery = $state('');
	let isOpen = $state(false);
	let filteredCodes = $state<ICD10Code[]>([]);
	let selectedCategory = $state<string>('all');
	let inputRef: HTMLInputElement;

	const categories = [
		{ value: 'all', label: 'Semua' },
		{ value: 'M', label: 'M - Muskuloskeletal' },
		{ value: 'S', label: 'S - Cedera' },
		{ value: 'G', label: 'G - Saraf' },
		{ value: 'I', label: 'I - Sirkulasi' },
		{ value: 'J', label: 'J - Respirasi' },
		{ value: 'R', label: 'R - Gejala' },
		{ value: 'Z', label: 'Z - Faktor' }
	];

	function filterCodes() {
		let result = codes;

		// Filter by category
		if (selectedCategory !== 'all') {
			result = result.filter(c => c.category === selectedCategory);
		}

		// Filter by search query
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			result = result.filter(c =>
				c.code.toLowerCase().includes(query) ||
				c.description.toLowerCase().includes(query) ||
				(c.descriptionId && c.descriptionId.toLowerCase().includes(query))
			);
		}

		// Sort: common first, then alphabetically
		result = result.sort((a, b) => {
			if (a.isCommon !== b.isCommon) return a.isCommon ? -1 : 1;
			return a.code.localeCompare(b.code);
		});

		filteredCodes = result.slice(0, 50); // Limit for performance
	}

	function selectCode(code: ICD10Code) {
		selectedCode = code.code;
		selectedDescription = showIndonesian && code.descriptionId ? code.descriptionId : code.description;
		searchQuery = `${code.code} - ${selectedDescription}`;
		isOpen = false;
	}

	function handleFocus() {
		isOpen = true;
		filterCodes();
	}

	function handleBlur(e: FocusEvent) {
		// Delay to allow click on dropdown item
		setTimeout(() => {
			isOpen = false;
		}, 200);
	}

	function clearSelection() {
		selectedCode = '';
		selectedDescription = '';
		searchQuery = '';
		filterCodes();
	}

	$effect(() => {
		filterCodes();
	});

	// Initialize with selected code if provided
	onMount(() => {
		if (selectedCode) {
			const code = codes.find(c => c.code === selectedCode);
			if (code) {
				searchQuery = `${code.code} - ${showIndonesian && code.descriptionId ? code.descriptionId : code.description}`;
			}
		}
	});
</script>

<div class="relative">
	<!-- Hidden inputs for form submission -->
	<input type="hidden" name={name} value={selectedCode} />
	<input type="hidden" name="{name}Description" value={selectedDescription} />

	<!-- Search input -->
	<div class="relative">
		<input
			type="text"
			bind:value={searchQuery}
			bind:this={inputRef}
			oninput={() => filterCodes()}
			onfocus={handleFocus}
			onblur={handleBlur}
			{placeholder}
			class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
			{required}
		/>
		{#if selectedCode}
			<button
				type="button"
				onclick={clearSelection}
				class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
			>
				✕
			</button>
		{/if}
	</div>

	<!-- Dropdown -->
	{#if isOpen}
		<div class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden">
			<!-- Category filter -->
			<div class="p-2 border-b bg-gray-50 flex flex-wrap gap-1">
				{#each categories as cat}
					<button
						type="button"
						class="px-2 py-1 text-xs rounded-full transition-colors
							{selectedCategory === cat.value 
								? 'bg-teal-600 text-white' 
								: 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
						onclick={() => { selectedCategory = cat.value; filterCodes(); }}
					>
						{cat.label}
					</button>
				{/each}
			</div>

			<!-- Results -->
			<div class="overflow-y-auto max-h-56">
				{#if filteredCodes.length === 0}
					<div class="p-4 text-center text-gray-500">
						Tidak ada kode ditemukan
					</div>
				{:else}
					{#each filteredCodes as code}
						<button
							type="button"
							class="w-full px-3 py-2 text-left hover:bg-teal-50 border-b border-gray-100 last:border-0"
							onclick={() => selectCode(code)}
						>
							<div class="flex items-center gap-2">
								<span class="px-1.5 py-0.5 text-xs rounded bg-gray-100 font-mono font-medium text-teal-700">
									{code.code}
								</span>
								{#if code.isCommon}
									<span class="text-xs text-orange-500">★</span>
								{/if}
							</div>
							<div class="text-sm text-gray-700 mt-0.5">
								{showIndonesian && code.descriptionId ? code.descriptionId : code.description}
							</div>
							{#if showIndonesian && code.descriptionId}
								<div class="text-xs text-gray-400">{code.description}</div>
							{/if}
						</button>
					{/each}
				{/if}
			</div>

			<!-- Footer -->
			<div class="p-2 border-t bg-gray-50 text-xs text-gray-500 text-center">
				{filteredCodes.length} kode ditemukan • ★ = Umum digunakan
			</div>
		</div>
	{/if}
</div>
