<script lang="ts">
	interface Marking {
		id: string;
		x: number;
		y: number;
		type: 'pain' | 'injury' | 'numbness' | 'weakness' | 'other';
		severity: 1 | 2 | 3;
		label: string;
		notes?: string;
	}

	let {
		markings = $bindable<Marking[]>([]),
		viewType = 'front',
		readonly = false,
		onMarkingAdd,
		onMarkingRemove
	}: {
		markings?: Marking[];
		viewType?: 'front' | 'back' | 'left' | 'right';
		readonly?: boolean;
		onMarkingAdd?: (marking: Marking) => void;
		onMarkingRemove?: (id: string) => void;
	} = $props();

	let selectedType = $state<Marking['type']>('pain');
	let selectedSeverity = $state<1 | 2 | 3>(2);
	let showAddForm = $state(false);
	let pendingMarkingPos: { x: number; y: number } | null = $state(null);
	let markingLabel = $state('');

	const typeLabels: Record<Marking['type'], { label: string; color: string; icon: string }> = {
		pain: { label: 'Nyeri', color: '#ef4444', icon: '🔴' },
		injury: { label: 'Cedera', color: '#f97316', icon: '🟠' },
		numbness: { label: 'Kebas', color: '#8b5cf6', icon: '🟣' },
		weakness: { label: 'Kelemahan', color: '#3b82f6', icon: '🔵' },
		other: { label: 'Lainnya', color: '#6b7280', icon: '⚫' }
	};

	const severityLabels = {
		1: { label: 'Ringan', size: 12 },
		2: { label: 'Sedang', size: 18 },
		3: { label: 'Berat', size: 24 }
	};

	function handleSvgClick(event: MouseEvent) {
		if (readonly) return;
		
		const svg = event.currentTarget as SVGElement;
		const rect = svg.getBoundingClientRect();
		const x = ((event.clientX - rect.left) / rect.width) * 100;
		const y = ((event.clientY - rect.top) / rect.height) * 100;
		
		pendingMarkingPos = { x, y };
		showAddForm = true;
		markingLabel = '';
	}

	function addMarking() {
		if (!pendingMarkingPos) return;
		
		const newMarking: Marking = {
			id: `mark-${Date.now()}`,
			x: pendingMarkingPos.x,
			y: pendingMarkingPos.y,
			type: selectedType,
			severity: selectedSeverity,
			label: markingLabel || typeLabels[selectedType].label
		};
		
		markings = [...markings, newMarking];
		onMarkingAdd?.(newMarking);
		
		showAddForm = false;
		pendingMarkingPos = null;
	}

	function removeMarking(id: string) {
		markings = markings.filter(m => m.id !== id);
		onMarkingRemove?.(id);
	}

	function cancelAdd() {
		showAddForm = false;
		pendingMarkingPos = null;
	}
</script>

<div class="body-diagram-container">
	<div class="flex flex-col lg:flex-row gap-4">
		<!-- SVG Body Diagram -->
		<div class="flex-1">
			<div class="bg-gray-50 rounded-xl p-4">
				<div class="flex justify-center items-center gap-2 mb-2">
					<span class="text-sm font-medium text-gray-600">
						{viewType === 'front' ? 'Tampak Depan' : 
						viewType === 'back' ? 'Tampak Belakang' : 
						viewType === 'left' ? 'Sisi Kiri' : 'Sisi Kanan'}
					</span>
				</div>
				
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<svg 
					viewBox="0 0 100 200" 
					class="w-full max-w-xs mx-auto cursor-crosshair"
					onclick={handleSvgClick}
				>
					<!-- Body outline - simplified human figure -->
					<g fill="none" stroke="#d1d5db" stroke-width="1">
						<!-- Head -->
						<ellipse cx="50" cy="15" rx="12" ry="14" fill="#f9fafb" />
						
						<!-- Neck -->
						<line x1="44" y1="28" x2="44" y2="35" />
						<line x1="56" y1="28" x2="56" y2="35" />
						
						<!-- Shoulders -->
						<line x1="20" y1="40" x2="44" y2="35" />
						<line x1="80" y1="40" x2="56" y2="35" />
						
						<!-- Torso -->
						<path d="M 20 40 L 20 100 Q 22 105 30 105 L 70 105 Q 78 105 80 100 L 80 40" fill="#f9fafb" />
						
						<!-- Arms -->
						<path d="M 20 40 Q 10 55 8 80 Q 6 95 10 100" fill="none" />
						<path d="M 80 40 Q 90 55 92 80 Q 94 95 90 100" fill="none" />
						
						<!-- Legs -->
						<path d="M 30 105 L 25 160 Q 24 175 27 180" fill="none" />
						<path d="M 35 105 L 38 160 Q 39 175 36 180" fill="none" />
						<path d="M 70 105 L 75 160 Q 76 175 73 180" fill="none" />
						<path d="M 65 105 L 62 160 Q 61 175 64 180" fill="none" />
						
						<!-- Feet -->
						<ellipse cx="31" cy="185" rx="8" ry="6" fill="#f9fafb" />
						<ellipse cx="69" cy="185" rx="8" ry="6" fill="#f9fafb" />
					</g>
					
					<!-- Body part labels -->
					<g font-size="3" fill="#9ca3af" text-anchor="middle">
						<text x="50" y="17">Kepala</text>
						<text x="50" y="33">Leher</text>
						<text x="20" y="38">Bahu</text>
						<text x="80" y="38">Bahu</text>
						<text x="50" y="55">Dada</text>
						<text x="50" y="80">Perut</text>
						<text x="50" y="95">Pinggang</text>
						<text x="8" y="70">Lengan</text>
						<text x="92" y="70">Lengan</text>
						<text x="31" y="140">Paha</text>
						<text x="69" y="140">Paha</text>
						<text x="31" y="170">Lutut</text>
						<text x="69" y="170">Lutut</text>
					</g>
					
					<!-- Markings -->
					{#each markings as marking}
						<g class="marking" style="cursor: pointer;">
							<circle 
								cx={marking.x} 
								cy={marking.y} 
								r={severityLabels[marking.severity].size / 3}
								fill={typeLabels[marking.type].color}
								opacity="0.8"
							/>
							{#if !readonly}
								<circle 
									cx={marking.x} 
									cy={marking.y} 
									r={severityLabels[marking.severity].size / 3 + 2}
									fill="transparent"
									stroke={typeLabels[marking.type].color}
									stroke-width="0.5"
									stroke-dasharray="1,1"
									class="animate-pulse"
								/>
							{/if}
							<text 
								x={marking.x} 
								y={marking.y - severityLabels[marking.severity].size / 3 - 2}
								font-size="3"
								fill="#374151"
								text-anchor="middle"
							>
								{marking.label}
							</text>
						</g>
					{/each}
					
					<!-- Pending marking indicator -->
					{#if pendingMarkingPos}
						<circle 
							cx={pendingMarkingPos.x} 
							cy={pendingMarkingPos.y} 
							r="4"
							fill={typeLabels[selectedType].color}
							opacity="0.5"
							class="animate-pulse"
						/>
					{/if}
				</svg>
			</div>
		</div>

		<!-- Controls and Legend -->
		<div class="w-full lg:w-64 space-y-4">
			{#if !readonly}
				<!-- Type Selection -->
				<div class="bg-white rounded-lg p-3 border border-gray-200">
					<p class="text-sm font-medium text-gray-700 mb-2">Tipe Penanda</p>
					<div class="space-y-1">
						{#each Object.entries(typeLabels) as [key, val]}
							<button
								onclick={() => selectedType = key as Marking['type']}
								class="w-full flex items-center gap-2 px-2 py-1 rounded text-sm transition-colors
									{selectedType === key ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}"
							>
								<span>{val.icon}</span>
								<span>{val.label}</span>
							</button>
						{/each}
					</div>
				</div>

				<!-- Severity Selection -->
				<div class="bg-white rounded-lg p-3 border border-gray-200">
					<p class="text-sm font-medium text-gray-700 mb-2">Tingkat Keparahan</p>
					<div class="flex gap-2">
						{#each [1, 2, 3] as sev}
							<button
								onclick={() => selectedSeverity = sev as 1 | 2 | 3}
								class="flex-1 py-2 rounded text-xs font-medium transition-colors
									{selectedSeverity === sev ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
							>
								{severityLabels[sev as 1 | 2 | 3].label}
							</button>
						{/each}
					</div>
				</div>

				<p class="text-xs text-gray-500 text-center">
					Klik pada diagram untuk menambah penanda
				</p>
			{/if}

			<!-- Markings List -->
			{#if markings.length > 0}
				<div class="bg-white rounded-lg p-3 border border-gray-200">
					<p class="text-sm font-medium text-gray-700 mb-2">Penanda ({markings.length})</p>
					<div class="space-y-2 max-h-48 overflow-y-auto">
						{#each markings as marking}
							<div class="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
								<div class="flex items-center gap-2">
									<span>{typeLabels[marking.type].icon}</span>
									<span>{marking.label}</span>
								</div>
								{#if !readonly}
									<button 
										onclick={() => removeMarking(marking.id)}
										class="text-red-500 hover:text-red-700"
									>
										×
									</button>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- Add Marking Modal -->
	{#if showAddForm}
		<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
			<div class="bg-white rounded-xl p-6 w-full max-w-sm mx-4">
				<h3 class="text-lg font-semibold mb-4">Tambah Penanda</h3>
				
				<div class="space-y-4">
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">Label</label>
						<input 
							type="text" 
							bind:value={markingLabel}
							placeholder={typeLabels[selectedType].label}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
						/>
					</div>
					
					<div class="flex gap-3">
						<button 
							onclick={cancelAdd}
							class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
						>
							Batal
						</button>
						<button 
							onclick={addMarking}
							class="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
						>
							Tambah
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.marking:hover circle {
		stroke-width: 2;
	}
</style>
