<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();

	let selectedCategory = $state<string | null>(null);
	let searchQuery = $state('');
	let selectedExercise = $state<typeof data.exercises[0] | null>(null);

	// Category labels in Indonesian
	const categoryLabels: Record<string, string> = {
		stretching: '🧘 Peregangan',
		strengthening: '💪 Penguatan',
		balance: '⚖️ Keseimbangan',
		endurance: '🏃 Daya Tahan',
		mobility: '🔄 Mobilitas',
		posture: '🧍 Postur',
		breathing: '🌬️ Pernapasan',
		other: '📋 Lainnya'
	};

	// Body part labels
	const bodyPartLabels: Record<string, string> = {
		neck: 'Leher',
		shoulder: 'Bahu',
		upper_back: 'Punggung Atas',
		lower_back: 'Punggung Bawah',
		chest: 'Dada',
		arm: 'Lengan',
		elbow: 'Siku',
		wrist: 'Pergelangan Tangan',
		hand: 'Tangan',
		hip: 'Pinggul',
		thigh: 'Paha',
		knee: 'Lutut',
		ankle: 'Pergelangan Kaki',
		foot: 'Kaki',
		core: 'Core',
		full_body: 'Seluruh Tubuh'
	};

	// Difficulty labels
	const difficultyLabels: Record<string, { label: string; color: string }> = {
		easy: { label: 'Mudah', color: 'bg-green-100 text-green-800' },
		medium: { label: 'Sedang', color: 'bg-yellow-100 text-yellow-800' },
		hard: { label: 'Sulit', color: 'bg-red-100 text-red-800' }
	};

	const filteredExercises = $derived(() => {
		let results = data.exercises;
		
		if (selectedCategory) {
			results = results.filter(e => e.category === selectedCategory);
		}
		
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			results = results.filter(e => 
				e.name.toLowerCase().includes(query) ||
				e.bodyPart.toLowerCase().includes(query) ||
				e.description.toLowerCase().includes(query)
			);
		}
		
		return results;
	});
</script>

<div class="space-y-6">
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<div>
			<h1 class="text-2xl font-bold text-gray-800">📚 Perpustakaan Latihan</h1>
			<p class="text-gray-600">Koleksi latihan fisioterapi untuk pasien</p>
		</div>
	</div>

	<!-- Search and Filters -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
		<div class="flex flex-col md:flex-row gap-4">
			<div class="flex-1">
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Cari latihan..."
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
				/>
			</div>
			<div class="flex gap-2 flex-wrap">
				<button
					onclick={() => selectedCategory = null}
					class="px-3 py-2 rounded-lg text-sm font-medium transition-colors
						{selectedCategory === null ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
				>
					Semua
				</button>
				{#each Object.entries(categoryLabels) as [key, label]}
					{#if data.categories[key]}
						<button
							onclick={() => selectedCategory = key}
							class="px-3 py-2 rounded-lg text-sm font-medium transition-colors
								{selectedCategory === key ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
						>
							{label}
						</button>
					{/if}
				{/each}
			</div>
		</div>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<!-- Exercise List -->
		<div class="lg:col-span-2 space-y-4">
			{#if filteredExercises().length === 0}
				<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
					<p class="text-gray-500">Tidak ada latihan yang ditemukan</p>
				</div>
			{:else}
				{#each filteredExercises() as exercise}
					<button
						onclick={() => selectedExercise = exercise}
						class="w-full text-left bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow
							{selectedExercise?.id === exercise.id ? 'ring-2 ring-teal-500' : ''}"
					>
						<div class="flex items-start gap-4">
							<div class="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
								{categoryLabels[exercise.category]?.slice(0, 2) || '📋'}
							</div>
							<div class="flex-1 min-w-0">
								<h3 class="font-semibold text-gray-800">{exercise.name}</h3>
								<p class="text-sm text-gray-500">{bodyPartLabels[exercise.bodyPart] || exercise.bodyPart}</p>
								<p class="text-sm text-gray-600 mt-1 line-clamp-2">{exercise.description}</p>
								<div class="flex gap-2 mt-2">
									<span class="px-2 py-0.5 text-xs rounded-full {difficultyLabels[exercise.difficulty || 'medium'].color}">
										{difficultyLabels[exercise.difficulty || 'medium'].label}
									</span>
									{#if exercise.defaultSets && exercise.defaultReps}
										<span class="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
											{exercise.defaultSets}x{exercise.defaultReps}
										</span>
									{/if}
								</div>
							</div>
						</div>
					</button>
				{/each}
			{/if}
		</div>

		<!-- Exercise Detail Panel -->
		<div class="lg:col-span-1">
			{#if selectedExercise}
				<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
					<div class="flex items-center gap-3 mb-4">
						<div class="w-14 h-14 bg-teal-100 rounded-lg flex items-center justify-center text-3xl">
							{categoryLabels[selectedExercise.category]?.slice(0, 2) || '📋'}
						</div>
						<div>
							<h2 class="text-lg font-bold text-gray-800">{selectedExercise.name}</h2>
							{#if selectedExercise.nameEn}
								<p class="text-sm text-gray-500">{selectedExercise.nameEn}</p>
							{/if}
						</div>
					</div>

					<div class="flex gap-2 mb-4">
						<span class="px-2 py-1 text-xs rounded-full bg-teal-100 text-teal-800">
							{bodyPartLabels[selectedExercise.bodyPart]}
						</span>
						<span class="px-2 py-1 text-xs rounded-full {difficultyLabels[selectedExercise.difficulty || 'medium'].color}">
							{difficultyLabels[selectedExercise.difficulty || 'medium'].label}
						</span>
					</div>

					<div class="space-y-4">
						<div>
							<h4 class="font-medium text-gray-700 mb-1">Deskripsi</h4>
							<p class="text-sm text-gray-600">{selectedExercise.description}</p>
						</div>

						<div>
							<h4 class="font-medium text-gray-700 mb-1">Instruksi</h4>
							<div class="text-sm text-gray-600 whitespace-pre-line bg-gray-50 p-3 rounded-lg">
								{selectedExercise.instructions}
							</div>
						</div>

						{#if selectedExercise.precautions}
							<div class="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
								<h4 class="font-medium text-yellow-800 mb-1">⚠️ Perhatian</h4>
								<p class="text-sm text-yellow-700">{selectedExercise.precautions}</p>
							</div>
						{/if}

						<div class="grid grid-cols-2 gap-3">
							{#if selectedExercise.defaultSets}
								<div class="bg-gray-50 rounded-lg p-3 text-center">
									<p class="text-2xl font-bold text-teal-600">{selectedExercise.defaultSets}</p>
									<p class="text-xs text-gray-500">Set</p>
								</div>
							{/if}
							{#if selectedExercise.defaultReps}
								<div class="bg-gray-50 rounded-lg p-3 text-center">
									<p class="text-2xl font-bold text-teal-600">{selectedExercise.defaultReps}</p>
									<p class="text-xs text-gray-500">Repetisi</p>
								</div>
							{/if}
							{#if selectedExercise.defaultHoldSeconds}
								<div class="bg-gray-50 rounded-lg p-3 text-center">
									<p class="text-2xl font-bold text-teal-600">{selectedExercise.defaultHoldSeconds}</p>
									<p class="text-xs text-gray-500">Detik Tahan</p>
								</div>
							{/if}
							{#if selectedExercise.defaultDurationMinutes}
								<div class="bg-gray-50 rounded-lg p-3 text-center">
									<p class="text-2xl font-bold text-teal-600">{selectedExercise.defaultDurationMinutes}</p>
									<p class="text-xs text-gray-500">Menit</p>
								</div>
							{/if}
						</div>
					</div>
				</div>
			{:else}
				<div class="bg-gray-50 rounded-xl p-8 text-center">
					<p class="text-gray-500">Pilih latihan untuk melihat detail</p>
				</div>
			{/if}
		</div>
	</div>
</div>
